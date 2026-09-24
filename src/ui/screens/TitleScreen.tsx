import React, { useState } from 'react';
import { authService } from '../../services/auth/authService';

interface TitleScreenProps {
  onStartGame: () => void;
  onEnterLobby: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onEnterLobby }) => {
  const [roomCode, setRoomCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleQuickPlay = async () => {
    await authService.signInAsGuest('Pip');
    onStartGame();
  };

  const handleGoogleAuth = async () => {
    await authService.signInWithGoogle();
    onEnterLobby();
  };

  const handleJoinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim().length >= 4) {
      onStartGame();
    }
  };

  return (
    <div className="sky-gradient-bg min-h-screen flex flex-col justify-between relative overflow-hidden select-none p-4 md:p-6">
      {/* Top Utility Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-20 pt-2">
        {/* Server Status Chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 shadow-sm border border-[#e2e7ff]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00b17b] animate-pulse"></span>
          <span className="font-rubik text-[11px] font-black text-[#131b2e] uppercase tracking-wide">
            Global Server: Fast
          </span>
        </div>

        {/* Language Selector Pill */}
        <button
          onClick={() => alert('Language set to English (US)')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 shadow-sm border border-[#e2e7ff] active:translate-y-0.5 transition-all text-[#131b2e]"
        >
          <span className="material-symbols-outlined text-[#006591] text-base">language</span>
          <span className="font-rubik text-[11px] font-black">EN / US</span>
          <span className="material-symbols-outlined text-[#6e7881] text-xs">expand_more</span>
        </button>
      </div>

      {/* Hero Branding Section */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto py-4">
        {/* 3D Glowing Pixel Rush Logo Badge */}
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-b from-[#fea619] to-[#855300] p-1.5 shadow-[0_16px_32px_rgba(254,166,25,0.4)] flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-2xl bg-[#0ea5e9] border-2 border-white flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[42px] md:text-[50px] text-white">
                sports_esports
              </span>
            </div>
          </div>
          <h1 className="font-rubik text-4xl md:text-5xl font-black text-[#006591] tracking-tight drop-shadow-[0_2px_4px_rgba(0,101,145,0.2)] mt-3">
            PIXEL RUSH
          </h1>
          {/* Slogan Pill */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fea619] text-[#684000] shadow-md -mt-1 transform -rotate-1">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
              hotel_class
            </span>
            <span className="font-rubik text-[11px] font-black tracking-widest uppercase">
              Race • Jump • Outsmart
            </span>
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
              hotel_class
            </span>
          </div>
        </div>

        {/* Floating Action Cloud Card */}
        <div className="w-full max-w-sm mx-auto mt-6 bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-[0_20px_40px_-10px_rgba(14,165,233,0.2)] border-2 border-[#e2e7ff] flex flex-col items-center">
          {/* Top Notch Pill */}
          <div className="px-3.5 py-1 rounded-full bg-[#c9e6ff] text-[#003751] flex items-center gap-1 shadow-xs -mt-8 mb-3">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="font-rubik text-[10px] font-black uppercase tracking-wider">
              2D Platform Racing Slice
            </span>
          </div>

          <h2 className="font-rubik text-xl md:text-2xl font-black text-[#131b2e] text-center">
            Ready to Rush?
          </h2>
          <p className="font-sans-body text-xs text-[#3e4850] text-center mt-1 mb-5">
            Dash through moving clouds, bounce pads, and obstacles in <strong>Cloud Climb</strong>!
          </p>

          {/* Action Buttons Stack */}
          <div className="w-full flex flex-col gap-3">
            {/* 1. Quick Play CTA (Direct to 2D Race) */}
            <button
              onClick={handleQuickPlay}
              className="w-full py-4 px-5 rounded-2xl bg-[#00b17b] hover:bg-[#059669] text-white shadow-[0_4px_0_0_#006c49,0_10px_16px_rgba(0,177,123,0.35)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">bolt</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-rubik text-base font-black leading-tight">Quick Play</span>
                  <span className="font-rubik text-[11px] opacity-90 leading-none">Instant match as Guest</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>

            {/* 2. Enter Main Lobby */}
            <button
              onClick={handleGoogleAuth}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] shadow-sm border border-[#dae2fd] active:scale-98 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-[#006591]">cottage</span>
                </div>
                <span className="font-rubik text-sm font-extrabold text-[#131b2e]">
                  Enter Main Lobby
                </span>
              </div>
              <span className="material-symbols-outlined text-[#6e7881] text-lg">chevron_right</span>
            </button>

            {/* 3. Secondary Options */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onEnterLobby()}
                className="flex-1 py-2 px-3 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#006591] font-rubik text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">account_circle</span>
                <span>Rush ID</span>
              </button>

              <button
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#855300] font-rubik text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">key</span>
                <span>Join Code</span>
              </button>
            </div>

            {/* Room Code Sub-Form */}
            {showCodeInput && (
              <form onSubmit={handleJoinCode} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SKY420"
                  className="flex-1 h-10 px-3 rounded-xl bg-[#eaedff] font-rubik text-xs font-black uppercase tracking-wider text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-[#fea619] text-[#684000] font-rubik text-xs font-black uppercase shadow-sm active:translate-y-0.5"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>

          {/* Social Proof Live Counter */}
          <div className="mt-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e2e7ff]/70">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="h-5 w-5 rounded-full bg-[#ffddb8] flex items-center justify-center text-xs">🐱</div>
              <div className="h-5 w-5 rounded-full bg-[#6ffbbe] flex items-center justify-center text-xs">🐰</div>
              <div className="h-5 w-5 rounded-full bg-[#c9e6ff] flex items-center justify-center text-xs">🤖</div>
            </div>
            <span className="font-rubik text-[11px] font-bold text-[#3e4850]">
              <strong className="text-[#00b17b]">148,290</strong> Dashers racing live!
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-[#6e7881] text-[11px] font-semibold pb-2">
        <span>Version 4.2.0 • 2D Platform Engine</span>
        <span>Touch &amp; Keyboard Ready</span>
      </div>
    </div>
  );
};
