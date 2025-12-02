import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceId } from '../hooks/useDeviceId';
import { usePlayer } from '../hooks/usePlayer';
import { Gift, Snowflake } from 'lucide-react';

export default function Join() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { player, loading } = usePlayer(deviceId);

  useEffect(() => {
    if (player && !loading) {
      navigate('/game');
    }
  }, [player, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-red-800 flex items-center justify-center p-4 relative overflow-hidden">
      <Snowflake className="absolute top-10 left-10 w-16 h-16 text-white/20 animate-spin" style={{ animationDuration: '10s' }} />
      <Snowflake className="absolute top-20 right-20 w-12 h-12 text-white/20 animate-spin" style={{ animationDuration: '15s' }} />
      <Snowflake className="absolute bottom-20 left-1/4 w-20 h-20 text-white/20 animate-spin" style={{ animationDuration: '12s' }} />
      <Snowflake className="absolute bottom-10 right-1/3 w-14 h-14 text-white/20 animate-spin" style={{ animationDuration: '8s' }} />

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
        <Gift className="w-24 h-24 mx-auto mb-6 text-red-600 animate-bounce" />

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Santa's Lost Present
        </h1>

        <p className="text-gray-600 mb-8">
          Help find the hidden present somewhere in Greater London!
        </p>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-500 text-sm">Assigning your festive nickname...</p>
          </div>
        ) : (
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-red-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Join the Hunt!
          </button>
        )}

        <div className="mt-8 text-sm text-gray-500 space-y-1">
          <p>Tap anywhere on the map to guess</p>
          <p>Get within 10 meters to win!</p>
        </div>
      </div>
    </div>
  );
}
