import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceId } from '../hooks/useDeviceId';
import { usePlayer } from '../hooks/usePlayer';
import { useRound } from '../hooks/useRound';
import { supabase } from '../lib/supabase';
import { loadGoogleMaps, LONDON_CENTER, LONDON_BOUNDS } from '../lib/googleMaps';
import { Gift } from 'lucide-react';

export default function PlayerGame() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { player, loading: playerLoading } = usePlayer(deviceId);
  const { round } = useRound();

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

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
      setMap(mapInstance);
      setMapsLoaded(true);
    } catch (err: any) {
      console.error('Error loading Google Maps:', err);
      setToast(err.message || 'Failed to load map');
    }
  };

  const handleMapClick = async (e: any) => {
    if (!player || !round || round.status !== 'running') {
      if (round?.status === 'idle') {
        setToast('Game not started yet');
      } else if (round?.status === 'finished') {
        setToast('Game has ended');
      }
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (!marker) {
      const google = (window as any).google;
      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: 'Your guess',
      });
      setMarker(newMarker);
    } else {
      marker.position = { lat, lng };
    }

    await submitGuess(lat, lng);
  };

  const submitGuess = async (lat: number, lng: number) => {
    if (submitting || !deviceId) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.functions.invoke('submit_guess', {
        body: { deviceId, lat, lng },
      });

      if (error) throw error;

      setToast('Guess submitted!');
    } catch (err: any) {
      console.error('Error submitting guess:', err);
      setToast(err.message || 'Failed to submit guess');
    } finally {
      setSubmitting(false);
    }
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
                Round {round.round_no} - {round.mode === 'elf' ? 'Elf Mode' : 'Normal'}
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
          <p className="text-sm font-medium text-gray-700">
            {marker ? 'Tap to move your guess' : 'Tap anywhere to place your guess'}
          </p>
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
