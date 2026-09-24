import React, { useState } from 'react';
import { authService } from '../../services/auth/authService';

interface TitleScreenProps {
  onStartGame: () => void;
  onEnterLobby: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onEnterLobby }) => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isOnline = authService.isOnlineMode();

  const handleContinueAsGuest = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await authService.signInAsGuest('Pip');
      onEnterLobby();
    } catch (err: any) {
      setAuthError(err?.message || 'Unable to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await authService.signInWithGoogle();
      onEnterLobby();
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#e0f2fe] via-[#faf8ff] to-[#f2f3ff] relative overflow-hidden">
      {/* Background Pixel Art Cloud Decors */}
      <div className="absolute top-12 left-8 w-28 h-8 bg-white/80 rounded-full blur-[1px] pointer-events-none"></div>
      <div className="absolute top-24 right-12 w-36 h-10 bg-white/70 rounded-full blur-[1px] pointer-events-none"></div>

      {/* Mode Status Pill */}
      <div className="z-10 mt-2">
        <span
          className={`px-3 py-1 rounded-full font-rubik text-[10px] font-black uppercase tracking-wider shadow-xs ${
            isOnline
              ? 'bg-[#00b17b]/20 text-[#006c49] border border-[#00b17b]/30'
              : 'bg-[#fea619]/25 text-[#855300] border border-[#fea619]/40'
          }`}
        >
          {isOnline ? '🟢 Firebase Online Mode' : '🟡 Local Development Mode'}
        </span>
      </div>

      {/* Main Title Banner & Logo */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] border-4 border-white shadow-[0_16px_32px_rgba(14,165,233,0.35)] flex items-center justify-center transform hover:rotate-3 transition-transform">
            <span className="material-symbols-outlined text-white text-[54px] animate-pulse">
              bolt
            </span>
          </div>
        </div>

        <h1 className="font-rubik text-4xl sm:text-5xl font-black text-[#131b2e] tracking-tight uppercase leading-none drop-shadow-xs">
          PIXEL RUSH
        </h1>
        <p className="font-rubik text-xs sm:text-sm font-bold text-[#006591] mt-1 tracking-wide uppercase">
          Multiplayer 2D Pixel Platformer Sprint
        </p>

        {authError && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-red-100 border border-red-200 text-red-700 font-rubik text-xs font-bold max-w-xs">
            {authError}
          </div>
        )}
      </div>

      {/* Auth & Play Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3 z-10 mb-4">
        {/* Continue With Google Button */}
        <button
          onClick={handleContinueWithGoogle}
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-gray-50 text-[#131b2e] font-rubik text-sm font-black border border-[#e2e7ff] shadow-[0_4px_0_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        {/* Continue As Guest Button */}
        <button
          onClick={handleContinueAsGuest}
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-sm font-black shadow-[0_4px_0_0_#855300] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span>{loading ? 'Entering...' : 'Continue as Guest'}</span>
        </button>

        {/* Quick Race CTA */}
        <button
          onClick={onStartGame}
          className="w-full py-2.5 text-center font-rubik text-xs font-bold text-[#006591] hover:text-[#0ea5e9] transition-colors"
        >
          ⚡ Quick Sprint (Instant Offline Play)
        </button>
      </div>
    </div>
  );
};
