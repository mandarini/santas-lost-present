import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Gift, Github, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const { isAuthenticated, loading, signInWithGitHub } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setError(null);
      await signInWithGitHub();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Gift className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-white/70">Santa's Lost Present</p>
        </div>

        <p className="text-white/80 mb-8">
          Sign in with GitHub to access the admin dashboard and control the game.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition font-semibold text-lg"
        >
          {signingIn ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Github className="w-6 h-6" />
          )}
          {signingIn ? 'Redirecting...' : 'Sign in with GitHub'}
        </button>

        <p className="text-white/50 text-sm mt-6">
          Only authorized admins can access the dashboard.
        </p>
      </div>
    </div>
  );
}
