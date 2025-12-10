import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDeviceId } from '../hooks/useDeviceId';
import { usePlayer } from '../hooks/usePlayer';
import { Gift, Snowflake, BookOpen, Gamepad2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-red-800 flex flex-col p-4 relative overflow-hidden">
      <Snowflake className="absolute top-10 left-10 w-16 h-16 text-white/20 animate-spin" style={{ animationDuration: '10s' }} />
      <Snowflake className="absolute top-20 right-20 w-12 h-12 text-white/20 animate-spin" style={{ animationDuration: '15s' }} />
      <Snowflake className="absolute bottom-20 left-1/4 w-20 h-20 text-white/20 animate-spin" style={{ animationDuration: '12s' }} />
      <Snowflake className="absolute bottom-10 right-1/3 w-14 h-14 text-white/20 animate-spin" style={{ animationDuration: '8s' }} />

      {/* Navigation Menu */}
      <nav className="relative z-20 mb-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Link
                to="/instructions"
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                <BookOpen className="w-5 h-5" />
                Instructions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/game"
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                <Gamepad2 className="w-5 h-5" />
                Game
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
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

      {/* Footer */}
      <footer className="relative z-20 mt-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/80 backdrop-blur-md rounded-lg border border-white/20 p-3">
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
              <div className="flex items-center gap-4 text-gray-300">
                <a
                  href="https://github.com/mandarini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://x.com/psybercity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>

                <a
                  href="https://psyber.city"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Website
                </a>

                <span className="text-gray-500">|</span>

                <a
                  href="https://github.com/mandarini/santas-lost-present"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                  Source Code
                </a>

                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z" />
                  </svg>
                  Supabase Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
