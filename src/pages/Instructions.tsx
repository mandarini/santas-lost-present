import { Link } from 'react-router-dom';
import { Gift, MapPin, Wand2, Hexagon, ArrowLeft, Target, Users, Trophy, Zap } from 'lucide-react';

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
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
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
                Get your guess marker within <strong>10 meters</strong> of the hidden present. The first player to achieve this wins!
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Distance Feedback</h4>
              <p className="text-gray-700 mb-3">
                Your marker changes color based on how close you are:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span>Freezing (&gt;5km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                  <span>Cold (2-5km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Cool (1-2km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-lime-500"></div>
                  <span>Warm (500m-1km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Warmer (200-500m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span>Hot (100-200m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Very Hot (50-100m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-800"></div>
                  <span>On Fire! (&lt;50m)</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                <strong>Note:</strong> The admin may enable distance display, showing exact distances like "5.2 km" or "150 m".
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
                Get your guess marker within <strong>10 meters</strong> of the present's current location. Since the target moves, timing is crucial!
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
                Same color system as Normal Mode - your marker shows how close you are to the current target location.
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
        <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
          <Link
            to="/game"
            className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Gift className="w-5 h-5" />
            Start Playing
          </Link>
        </div>
      </div>
    </div>
  );
}

