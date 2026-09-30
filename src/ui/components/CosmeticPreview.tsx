/**
 * Pixel Rush Cosmetic Preview Component
 * Reusable visual renderer for Runner Skin + Hat + Particle Trail combinations.
 */

import React from 'react';
import { getCosmeticById } from '../../game/cosmetics/cosmeticRegistry';

interface CosmeticPreviewProps {
  skinId: string;
  hatId?: string;
  trailId?: string;
  size?: 'sm' | 'md' | 'lg';
  showPodium?: boolean;
  className?: string;
}

export const CosmeticPreview: React.FC<CosmeticPreviewProps> = ({
  skinId,
  hatId = 'none_hat',
  trailId = 'none_trail',
  size = 'md',
  showPodium = true,
  className = '',
}) => {
  const skin = getCosmeticById(skinId) || getCosmeticById('classic_runner')!;
  const hat = getCosmeticById(hatId) || getCosmeticById('none_hat')!;
  const trail = getCosmeticById(trailId) || getCosmeticById('none_trail')!;

  const colors = skin.colors;

  const sizeClasses = {
    sm: {
      container: 'w-24 h-24',
      avatar: 'w-20 h-20',
      podium: 'w-28 h-5 text-[8px]',
      scale: 'scale-75',
    },
    md: {
      container: 'w-36 h-36',
      avatar: 'w-32 h-32',
      podium: 'w-44 h-8 text-[10px]',
      scale: 'scale-100',
    },
    lg: {
      container: 'w-48 h-48',
      avatar: 'w-44 h-44',
      podium: 'w-56 h-10 text-xs',
      scale: 'scale-125',
    },
  }[size];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Trail Particle Visualizers */}
      {trail.id !== 'none_trail' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {trail.id === 'cloud_trail' && (
            <div className="absolute -bottom-2 flex gap-4 animate-pulse">
              <span className="w-4 h-4 rounded-full bg-white/80 shadow-md"></span>
              <span className="w-6 h-6 rounded-full bg-white/90 shadow-md"></span>
              <span className="w-3 h-3 rounded-full bg-white/70 shadow-md"></span>
            </div>
          )}
          {trail.id === 'spark_trail' && (
            <div className="absolute -bottom-2 flex gap-3">
              <span className="material-symbols-outlined text-[#facc15] text-[20px] animate-bounce">bolt</span>
              <span className="material-symbols-outlined text-[#fbbf24] text-[16px] animate-spin">stars</span>
            </div>
          )}
          {trail.id === 'leaf_trail' && (
            <div className="absolute -bottom-2 flex gap-3">
              <span className="material-symbols-outlined text-[#22c55e] text-[18px] animate-bounce">eco</span>
              <span className="material-symbols-outlined text-[#16a34a] text-[14px]">psychiatry</span>
            </div>
          )}
          {trail.id === 'candy_trail' && (
            <div className="absolute -bottom-2 flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f43f5e] shadow-xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#38bdf8] shadow-xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#fbbf24] shadow-xs"></span>
            </div>
          )}
        </div>
      )}

      {/* Main Avatar Bubble */}
      <div
        className={`${sizeClasses.avatar} rounded-full bg-gradient-to-b from-[#e0f2fe] to-[#f2f3ff] border-4 border-white shadow-[0_12px_24px_rgba(14,165,233,0.25)] flex items-center justify-center transition-transform hover:scale-105`}
      >
        <div className={`relative flex flex-col items-center ${sizeClasses.scale}`}>
          {/* Hat / Headwear */}
          {hat.id !== 'none_hat' && (
            <div className="absolute -top-4 z-20 flex items-center justify-center">
              {hat.id === 'cloud_cap' && (
                <div className="w-12 h-6 bg-[#e0f2fe] border-2 border-white rounded-t-full shadow-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
              )}
              {hat.id === 'explorer_hat' && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-4 bg-[#d97706] rounded-t-md shadow-xs"></div>
                  <div className="w-16 h-2 bg-[#b45309] rounded-full -mt-0.5"></div>
                </div>
              )}
              {hat.id === 'pilot_goggles' && (
                <div className="w-14 h-4 bg-[#3b82f6] rounded-full border border-white flex items-center justify-around px-1 shadow-xs">
                  <div className="w-3 h-3 rounded-full bg-[#fbbf24] border border-white"></div>
                  <div className="w-3 h-3 rounded-full bg-[#fbbf24] border border-white"></div>
                </div>
              )}
              {hat.id === 'star_crown' && (
                <div className="flex items-center gap-0.5 -mb-1 animate-pulse">
                  <span className="material-symbols-outlined text-[#fbbf24] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    crown
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Default Cap & Goggles if no custom hat */}
          {hat.id === 'none_hat' && (
            <div
              className="w-16 h-7 rounded-t-full relative flex items-center justify-center shadow-xs"
              style={{ backgroundColor: colors.cap || colors.secondary }}
            >
              <div className="w-10 h-3 bg-white/30 rounded-full border border-white flex items-center justify-around px-1">
                <div className="w-2 h-2 rounded-full bg-white/90"></div>
                <div className="w-2 h-2 rounded-full bg-white/90"></div>
              </div>
            </div>
          )}

          {/* Head & Face */}
          <div
            className="w-14 h-12 rounded-b-2xl flex flex-col items-center justify-center -mt-1 shadow-inner z-10"
            style={{ backgroundColor: colors.skin || '#ffe0bd' }}
          >
            <div className="flex gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#131b2e]"></div>
              <div className="w-2 h-2 rounded-full bg-[#131b2e]"></div>
            </div>
            <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }}></div>
          </div>

          {/* Hoodie / Body */}
          <div
            className="w-18 h-10 rounded-xl -mt-1 flex items-center justify-center shadow-md z-10"
            style={{ backgroundColor: colors.primary }}
          >
            <div className="w-1.5 h-8 opacity-60" style={{ backgroundColor: colors.secondary }}></div>
          </div>

          {/* Sneakers */}
          <div className="flex gap-4 -mt-1 z-10">
            <div
              className="w-6 h-3 rounded-md border-b-2 border-white shadow-xs"
              style={{ backgroundColor: colors.accent }}
            ></div>
            <div
              className="w-6 h-3 rounded-md border-b-2 border-white shadow-xs"
              style={{ backgroundColor: colors.accent }}
            ></div>
          </div>
        </div>
      </div>

      {/* Floating Podium Turf */}
      {showPodium && (
        <div
          className={`${sizeClasses.podium} bg-[#00b17b] rounded-full border-b-4 border-[#006c49] shadow-md flex items-center justify-center mt-2 px-3`}
        >
          <span className="font-rubik font-black text-white uppercase tracking-wider">
            {skin.name}
          </span>
        </div>
      )}
    </div>
  );
};
