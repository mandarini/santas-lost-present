import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceId } from '../hooks/useDeviceId';
import { usePlayer } from '../hooks/usePlayer';
import { useRound } from '../hooks/useRound';
import { useGuesses } from '../hooks/useGuesses';
import { supabase } from '../lib/supabase';
import { loadGoogleMaps, LONDON_CENTER, LONDON_BOUNDS, getMarkerColor, getTemperatureLabel, getPolygonOpacity } from '../lib/googleMaps';
import { Gift } from 'lucide-react';

export default function PlayerGame() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { player, loading: playerLoading } = usePlayer(deviceId);
  const { round } = useRound();
  const guesses = useGuesses(round?.round_no ?? null);

  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const [giftPolygon, setGiftPolygon] = useState<google.maps.Polygon | null>(null);

  // Use refs to avoid stale closures in map click handler
  const roundRef = useRef(round);
  const playerRef = useRef(player);
  const markerRef = useRef(marker);
  const lastDistanceRef = useRef(lastDistance);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    markerRef.current = marker;
  }, [marker]);

  useEffect(() => {
    lastDistanceRef.current = lastDistance;
  }, [lastDistance]);

  useEffect(() => {
    if (!player) return;
    initMap();
  }, [player]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Effect to render/update polygon in polygon mode
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance || !round || round.mode !== 'polygon' || !round.polygon_coords) {
      // Clean up existing polygon if mode changed
      if (giftPolygon) {
        giftPolygon.setMap(null);
        setGiftPolygon(null);
      }
      return;
    }

    const google = (window as any).google;
    if (!google) return;

    const guessCount = guesses.size;
    const opacity = getPolygonOpacity(guessCount);

    // Create polygon if doesn't exist
    if (!giftPolygon) {
      const polygon = new google.maps.Polygon({
        paths: round.polygon_coords,
        strokeColor: '#c41e3a',
        strokeOpacity: opacity,
        strokeWeight: 3,
        fillColor: '#c41e3a',
        fillOpacity: opacity * 0.35,
        map: mapInstance,
      });
      setGiftPolygon(polygon);
    } else {
      // Update opacity based on guess count
      giftPolygon.setOptions({
        strokeOpacity: opacity,
        fillOpacity: opacity * 0.35,
      });
    }
  }, [round?.mode, round?.polygon_coords, guesses.size, mapInstanceRef.current]);

  // Cleanup polygon on unmount
  useEffect(() => {
    return () => {
      if (giftPolygon) {
        giftPolygon.setMap(null);
      }
    };
  }, []);

  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      await loadGoogleMaps();
      const google = (window as any).google;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: LONDON_CENTER,
        zoom: 10,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined,
        restriction: {
          latLngBounds: LONDON_BOUNDS,
          strictBounds: false,
        },
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstance.addListener('click', handleMapClick);
      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);
    } catch (err: any) {
      console.error('Error loading Google Maps:', err);
      setToast(err.message || 'Failed to load map');
    }
  };

  const handleMapClick = async (e: any) => {
    const currentRound = roundRef.current;
    const currentPlayer = playerRef.current;
    const currentMarker = markerRef.current;

    if (!currentPlayer || !currentRound || currentRound.status !== 'running') {
      if (currentRound?.status === 'idle') {
        setToast('Game not started yet');
      } else if (currentRound?.status === 'finished') {
        setToast('Game has ended');
      } else if (!currentRound) {
        setToast('Loading game...');
      }
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const google = (window as any).google;
    console.log(playerRef.current?.color);

    // Use last distance color if available, otherwise use player's color
    const initialColor = lastDistanceRef.current !== null
      ? getMarkerColor(lastDistanceRef.current)
      : (playerRef.current?.color || '#EF4444');

    const markerContent = document.createElement('div');
    markerContent.style.cssText = `
      display: inline-block;
      background: ${initialColor};
      padding: 8px 16px;
      border-radius: 24px;
      color: white;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 3px solid white;
      font-size: 14px;
      white-space: nowrap;
    `;
    markerContent.textContent = `📍 ${playerRef.current?.nickname || 'You'}`;
    console.log('Creating marker at:', lat, lng);

    if (!currentMarker) {
      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat, lng },
        content: markerContent,
        title: 'Your guess',
      });
      markerRef.current = newMarker;
      setMarker(newMarker);
    } else {
      currentMarker.position = { lat, lng };
      currentMarker.content = markerContent;
    }

    await submitGuess(lat, lng);
  };

  const submitGuess = async (lat: number, lng: number) => {
    if (submitting || !deviceId) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke('submit_guess', {
        body: { deviceId, lat, lng },
      });

      if (error) throw error;

      // In polygon mode, no distance feedback - just confirm submission
      if (roundRef.current?.mode === 'polygon') {
        setToast('Guess submitted!');
        return;
      }

      // Update distance and marker color based on server response
      console.log('Server response:', data);
      if (data?.distance_m !== undefined && data.distance_m !== null) {
        console.log('Distance:', data.distance_m, 'Color:', getMarkerColor(data.distance_m));
        setLastDistance(data.distance_m);
        updateMarkerWithDistance(data.distance_m);

        // Show distance in toast if admin enabled it
        const tempLabel = getTemperatureLabel(data.distance_m);
        if (roundRef.current?.show_distance) {
          const distanceStr = data.distance_m >= 1000
            ? `${(data.distance_m / 1000).toFixed(1)} km`
            : `${Math.round(data.distance_m)} m`;
          setToast(`${tempLabel} (${distanceStr})`);
        } else {
          setToast(tempLabel);
        }
      } else {
        console.log('No distance returned from server');
        setToast('Guess submitted!');
      }
    } catch (err: any) {
      console.error('Error submitting guess:', err);
      setToast(err.message || 'Failed to submit guess');
    } finally {
      setSubmitting(false);
    }
  };

  const updateMarkerWithDistance = (distance: number) => {
    const currentMarker = markerRef.current;
    if (!currentMarker) {
      console.log('No marker to update');
      return;
    }

    const color = getMarkerColor(distance);
    console.log('Updating marker with distance:', distance, 'color:', color);
    const markerContent = document.createElement('div');
    markerContent.style.cssText = `
      display: inline-block;
      background: ${color};
      padding: 8px 16px;
      border-radius: 24px;
      color: white;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 3px solid white;
      font-size: 14px;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    `;
    markerContent.textContent = playerRef.current?.nickname || 'You';
    currentMarker.content = markerContent;
  };

  if (playerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-red-800 flex items-center justify-center">
        <div className="text-white text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-xl">Joining the hunt...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-red-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Failed to Join</h1>
          <p className="text-gray-600 mb-6">Unable to assign a nickname. Please try again.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Playing as</p>
            <p className="text-lg font-bold" style={{ color: player.color }}>
              {player.nickname}
            </p>
          </div>
          <div className="text-right">
            {round?.status === 'idle' && (
              <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Waiting to start...
              </span>
            )}
            {round?.status === 'running' && (
              <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                Round {round.round_no} - {round.mode === 'elf' ? 'Elf Mode' : round.mode === 'polygon' ? 'Polygon Hunt' : 'Normal'}
              </span>
            )}
            {round?.status === 'finished' && (
              <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Game Over
              </span>
            )}
          </div>
        </div>
      </div>

      {round?.status === 'running' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3">
          {round.mode === 'polygon' ? (
            // Polygon mode - no distance feedback, show guess count hint
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {guesses.size > 0
                  ? `${guesses.size} guesses made - ${getPolygonOpacity(guesses.size) * 100}% revealed`
                  : 'Tap anywhere to place your guess'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Find the hidden gift polygon!</p>
            </div>
          ) : lastDistance !== null ? (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getMarkerColor(lastDistance) }}
              />
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: getMarkerColor(lastDistance) }}
                >
                  {getTemperatureLabel(lastDistance)}
                  {round?.show_distance && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({lastDistance >= 1000
                        ? `${(lastDistance / 1000).toFixed(1)} km`
                        : `${Math.round(lastDistance)} m`})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Tap to move your guess</p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-700">
              Tap anywhere to place your guess
            </p>
          )}
        </div>
      )}

      {round?.status === 'finished' && round.winner_player_id === player.id && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center animate-bounce">
            <Gift className="w-24 h-24 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-4xl font-bold text-green-600 mb-2">You Won!</h1>
            <p className="text-gray-600">
              You found the present! Distance: {round.winner_distance_m?.toFixed(1)}m
            </p>
          </div>
        </div>
      )}

      {round?.status === 'finished' && round.winner_player_id !== player.id && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Game Over</h1>
            <p className="text-gray-600">Check the big screen for results!</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
