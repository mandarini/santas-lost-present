/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { useRound } from '../hooks/useRound';
import { useGuesses } from '../hooks/useGuesses';
import { usePlayers } from '../hooks/usePlayers';
import { useAuth } from '../hooks/useAuth';
import { supabase, Player, Guess } from '../lib/supabase';
import {
  loadGoogleMaps,
  LONDON_CENTER,
  LONDON_BOUNDS,
  calculateDistance,
  getMarkerColor,
  randomLondonLocation,
} from '../lib/googleMaps';
import { Play, Square, RotateCcw, Wand2, Trophy, Users, LogOut, Gift, Eye, EyeOff } from 'lucide-react';
import { createPresentOverlay, removePresentOverlay } from '../components/WebGLPresentOverlay';

export default function AdminDashboard() {
  const { round } = useRound();
  const guesses = useGuesses(round?.round_no ?? null);
  const players = usePlayers();
  const { user, signOut } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Map<string, any>>(new Map());
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [playerDistances, setPlayerDistances] = useState<Map<string, number>>(new Map());
  const [actionLoading, setActionLoading] = useState(false);
  const [showGiftOverlay, setShowGiftOverlay] = useState(false);
  const [webglOverlay, setWebglOverlay] = useState<google.maps.WebGLOverlayView | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    if (!map || !round || round.status !== 'running') return;

    updateAllMarkers();
  }, [guesses, round, map, players]);

  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      await loadGoogleMaps();
      const google = (window as any).google;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: LONDON_CENTER,
        zoom: 10,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
        renderingType: 'WEBGL', // Required for WebGLOverlayView
        restriction: {
          latLngBounds: LONDON_BOUNDS,
          strictBounds: false,
        },
      });

      mapInstance.addListener('click', (e: any) => {
        setTargetLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });

      setMap(mapInstance);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      alert('Failed to load map. Please check your Google Maps API key.');
    }
  };

  const updateAllMarkers = () => {
    if (!map || !round || !round.target_lat || !round.target_lng) return;

    const newDistances = new Map<string, number>();

    guesses.forEach((guess, playerId) => {
      const player = players.get(playerId);
      if (!player) return;

      const distance = calculateDistance(
        guess.lat,
        guess.lng,
        round.target_lat!,
        round.target_lng!
      );

      newDistances.set(playerId, distance);

      if (round.status === 'running' && distance <= 20000) { // DEBUG: 20km for testing
        triggerWin(playerId, distance);
        return;
      }

      const color = getMarkerColor(distance);
      updateMarker(playerId, guess, player, color);
    });

    setPlayerDistances(newDistances);
    // NOTE: Target marker intentionally NOT shown to prevent cheating!
    // The target location is only revealed in the finale animation.
  };

  const updateMarker = (playerId: string, guess: Guess, player: Player, color: string) => {
    const google = (window as any).google;

    const markerContent = document.createElement('div');
    markerContent.style.cssText = `
      background: ${color};
      padding: 8px 12px;
      border-radius: 20px;
      color: white;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      white-space: nowrap;
      font-size: 14px;
    `;
    markerContent.textContent = player.nickname;

    if (markers.has(playerId)) {
      const marker = markers.get(playerId);
      marker.position = { lat: guess.lat, lng: guess.lng };
      marker.content = markerContent;
    } else {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: guess.lat, lng: guess.lng },
        content: markerContent,
      });
      setMarkers((prev) => {
        const next = new Map(prev);
        next.set(playerId, marker);
        return next;
      });
    }
  };

  const triggerWin = async (winnerId: string, distance: number) => {
    if (!round || round.status !== 'running') return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke('admin_actions', {
        body: {
          action: 'set_winner',
          winner_player_id: winnerId,
          winner_distance_m: distance,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Get winner name for display
      const winner = players.get(winnerId);
      if (winner) {
        setWinnerName(winner.nickname);
      }

      // Show 3D present animation at the target location
      if (map && round.target_lat && round.target_lng) {
        setShowGiftOverlay(true);

        const overlay = createPresentOverlay({
          map,
          position: { lat: round.target_lat, lng: round.target_lng },
          onAnimationComplete: () => {
            // Animation finished - keep the present visible
          },
        });
        setWebglOverlay(overlay);
      }
    } catch (err) {
      console.error('Error setting winner:', err);
    }
  };

  const handleStartRound = async (mode: 'normal' | 'elf') => {
    const location = targetLocation || randomLondonLocation();

    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Not authenticated. Please log in.');
        return;
      }

      const { error } = await supabase.functions.invoke('admin_actions', {
        body: {
          action: 'start_round',
          mode,
          target_lat: location.lat,
          target_lng: location.lng,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setTargetLocation(location);
    } catch (err: any) {
      console.error('Error starting round:', err);
      alert(err.message || 'Failed to start round');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopRound = async () => {
    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin_actions', {
        body: { action: 'stop_round' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error stopping round:', err);
      alert(err.message || 'Failed to stop round');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetRound = async () => {
    if (!confirm('Reset the round? This will clear all guesses.')) return;

    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin_actions', {
        body: { action: 'reset_round' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      markers.forEach((marker) => {
        marker.map = null;
      });
      setMarkers(new Map());
      setTargetLocation(null);
      setShowGiftOverlay(false);
      setWinnerName(null);

      // Clean up WebGL overlay
      if (webglOverlay) {
        removePresentOverlay(webglOverlay);
        setWebglOverlay(null);
      }
    } catch (err: any) {
      console.error('Error resetting round:', err);
      alert(err.message || 'Failed to reset round');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleShowDistance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin_actions', {
        body: { action: 'toggle_show_distance' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error toggling show distance:', err);
      alert(err.message || 'Failed to toggle show distance');
    }
  };

  const sortedPlayers = Array.from(guesses.entries())
    .map(([playerId, guess]) => {
      const player = players.get(playerId);
      const distance = playerDistances.get(playerId) || 0;
      return { player, guess, distance };
    })
    .filter((item) => item.player)
    .sort((a, b) => a.distance - b.distance);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-gray-900 text-white p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Admin
          </h1>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {user && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-400">Round</p>
            <p className="text-xl font-bold">#{round?.round_no || 0}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Status</p>
            <div className="flex items-center gap-2">
              {round?.status === 'running' && (
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              )}
              <p className="text-lg font-semibold capitalize">{round?.status || 'idle'}</p>
            </div>
          </div>

          {round?.mode && round.status === 'running' && (
            <div>
              <p className="text-sm text-gray-400">Mode</p>
              <p className="text-lg font-semibold capitalize">{round.mode}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Players
            </p>
            <p className="text-xl font-bold">{guesses.size}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {round?.status === 'idle' && (
            <>
              <button
                onClick={() => handleStartRound('normal')}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Play className="w-5 h-5" />
                Start Normal Mode
              </button>

              <button
                onClick={() => handleStartRound('elf')}
                disabled={actionLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Wand2 className="w-5 h-5" />
                Start Elf Mode
              </button>
            </>
          )}

          {round?.status === 'running' && (
            <button
              onClick={handleStopRound}
              disabled={actionLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Square className="w-5 h-5" />
              Stop Round
            </button>
          )}

          {round?.status === 'finished' && (
            <button
              onClick={handleResetRound}
              disabled={actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Round
            </button>
          )}
        </div>

        {/* Show Distance Toggle */}
        <div className="mb-6 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Show distance to players</span>
            <button
              onClick={handleToggleShowDistance}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                round?.show_distance ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  round?.show_distance ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {round?.show_distance ? 'Players can see their distance (e.g. "5.2 km")' : 'Players only see temperature hints'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold mb-3">Players by Distance</h2>
          <div className="space-y-2">
            {sortedPlayers.map(({ player, distance }) => (
              <div
                key={player!.id}
                className="flex items-center justify-between p-2 bg-gray-800 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getMarkerColor(distance) }}
                  ></div>
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {player!.nickname}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance.toFixed(0)}m`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Winner celebration overlay */}
        {showGiftOverlay && winnerName && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
              <div className="flex items-center gap-4">
                <Gift className="w-10 h-10" />
                <div>
                  <p className="text-sm font-medium opacity-90">Present Found!</p>
                  <p className="text-2xl font-bold">{winnerName} Wins!</p>
                </div>
                <Gift className="w-10 h-10" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
