import { Link } from 'react-router-dom';
import { Gift, MapPin, Wand2, Hexagon, Target, Users, Trophy, Zap, Home } from 'lucide-react';

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-red-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gift className="w-10 h-10 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-900">How to Play</h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
          <p className="text-gray-600 text-lg">
            Help find Santa's lost present somewhere in Greater London!
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Start
          </h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <span>Navigate to the game URL on your phone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <span>You'll automatically be assigned a festive Christmas nickname</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <span>Wait for the admin to start a round</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <span>Tap anywhere on the map to place your guess</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
              <span>Update your guess as many times as you want</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
              <span>Win by meeting the mode-specific victory condition!</span>
            </li>
          </ol>
        </div>

        {/* Game Modes */}
        <div className="space-y-6 mb-6">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Game Modes</h2>

          {/* Normal Mode */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">Normal Mode</h3>
            </div>
            <p className="text-gray-700 mb-4">
              The classic treasure hunt! The present is hidden at a fixed location somewhere in Greater London.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                How to Win
              </h4>
              <p className="text-gray-700">
                Get your guess marker within <strong>1 kilometer</strong> of the hidden present. The first player to achieve this wins!
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Distance Feedback</h4>
              <p className="text-gray-700 mb-3">
                Your marker changes color smoothly from red (close) to blue (far), and you'll see temperature labels:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎁</span>
                  <span className="font-medium">YOU WIN!</span>
                  <span className="text-gray-600 ml-auto">≤ 1 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium">BURNING HOT!</span>
                  <span className="text-gray-600 ml-auto">≤ 2 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium">Very Hot!</span>
                  <span className="text-gray-600 ml-auto">≤ 5 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌡️</span>
                  <span className="font-medium">Hot</span>
                  <span className="text-gray-600 ml-auto">≤ 10 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌡️</span>
                  <span className="font-medium">Warm</span>
                  <span className="text-gray-600 ml-auto">≤ 15 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">😐</span>
                  <span className="font-medium">Lukewarm</span>
                  <span className="text-gray-600 ml-auto">≤ 20 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">❄️</span>
                  <span className="font-medium">Cool</span>
                  <span className="text-gray-600 ml-auto">≤ 25 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥶</span>
                  <span className="font-medium">Very Cold</span>
                  <span className="text-gray-600 ml-auto">≤ 30 km</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧊</span>
                  <span className="font-medium">Freezing!</span>
                  <span className="text-gray-600 ml-auto">&gt; 30 km</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                <strong>Note:</strong> Your marker color smoothly transitions from red (close) to blue (far). The admin may also enable distance display, showing exact distances like "5.2 km" or "150 m".
              </p>
            </div>
          </div>

          {/* Elf Mode */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-8 h-8 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">Elf Mode</h3>
            </div>
            <p className="text-gray-700 mb-4">
              The mischievous elves are moving the present! The target location changes every <strong>20 seconds</strong> to a new random spot in Greater London.
            </p>
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                How to Win
              </h4>
              <p className="text-gray-700">
                Get your guess marker within <strong>1 kilometer</strong> of the present's current location. Since the target moves, timing is crucial!
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Strategy Tips</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Watch your marker color closely - if it suddenly gets colder, the target has moved!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Try to predict where the elves might move next based on the pattern</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Quick reactions are key - update your guess frequently</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Distance Feedback</h4>
              <p className="text-gray-700">
                Same color and temperature label system as Normal Mode - your marker smoothly transitions from red (close) to blue (far) and shows temperature labels based on your distance to the current target location.
              </p>
            </div>
          </div>

          {/* Polygon Mode */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Hexagon className="w-8 h-8 text-rose-600" />
              <h3 className="text-2xl font-bold text-gray-900">Polygon Hunt Mode</h3>
            </div>
            <p className="text-gray-700 mb-4">
              A collaborative challenge! The present is hidden somewhere inside a secret polygon-shaped area on the map. Work together with other players to find it!
            </p>
            <div className="bg-rose-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                How to Win
              </h4>
              <p className="text-gray-700 mb-2">
                When <strong>10 players</strong> have their guesses inside the hidden polygon, everyone inside wins together!
              </p>
              <p className="text-gray-600 text-sm">
                This is a team victory - no single winner, but a group celebration!
              </p>
            </div>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-rose-600" />
                Polygon Visibility
              </h4>
              <p className="text-gray-700 mb-2">
                The hidden polygon becomes more visible as players get closer to finding it:
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>0-2 players inside:</strong> Polygon is nearly invisible</li>
                <li>• <strong>3-5 players inside:</strong> Polygon starts to appear faintly</li>
                <li>• <strong>6-8 players inside:</strong> Polygon becomes clearly visible</li>
                <li>• <strong>9-10 players inside:</strong> Polygon is fully visible - victory is near!</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Marker Colors</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Green = Inside polygon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-gray-700">Gray = Outside polygon</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Note:</strong> You won't see distance feedback in Polygon Mode - only whether you're inside or outside the target area.
              </p>
            </div>
          </div>
        </div>

        {/* Tips & Tricks */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Tips & Tricks
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">General Strategy</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>Use landmarks and your knowledge of London to narrow down locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>Watch other players' markers on the big screen (if visible) - they might be onto something!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>Don't be afraid to make multiple guesses - there's no penalty for trying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>In Normal and Elf modes, pay attention to your marker color changes</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Mobile Tips</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Pinch to zoom on the map for more precise guessing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Rotate your device to landscape for a wider view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Make sure your location services are enabled for better map performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 text-center mb-6">
          <Link
            to="/game"
            className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Gift className="w-5 h-5" />
            Start Playing
          </Link>
        </div>

        {/* Footer */}
        <footer className="relative z-20">
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
    </div>
  );
}

