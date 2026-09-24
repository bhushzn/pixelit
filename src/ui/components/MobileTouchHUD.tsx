import React from 'react';

export interface TouchInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  dash: boolean;
}

interface MobileTouchHUDProps {
  onInputChange: (input: TouchInputState) => void;
  inputState: TouchInputState;
}

export const MobileTouchHUD: React.FC<MobileTouchHUDProps> = ({ onInputChange, inputState }) => {
  const updateInput = (key: keyof TouchInputState, value: boolean) => {
    onInputChange({
      ...inputState,
      [key]: value,
    });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 landscape:p-2.5 pointer-events-none z-40 select-none touch-none flex items-end justify-between">
      {/* Bottom Left: Direction Buttons (Left & Right) */}
      <div className="flex items-center gap-3 landscape:gap-2 pointer-events-auto">
        {/* Left Arrow Button */}
        <button
          type="button"
          aria-label="Move Left"
          onTouchStart={(e) => { e.preventDefault(); updateInput('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('left', false); }}
          onMouseDown={() => updateInput('left', true)}
          onMouseUp={() => updateInput('left', false)}
          onMouseLeave={() => updateInput('left', false)}
          className={`w-14 h-14 md:w-16 md:h-16 landscape:w-12 landscape:h-12 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-[#0ea5e9] flex items-center justify-center text-[#006591] shadow-[0_8px_16px_rgba(0,101,145,0.25)] transition-all ${
            inputState.left ? 'scale-90 bg-[#c9e6ff] translate-y-1' : 'active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[32px] landscape:text-[26px]">arrow_back</span>
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          aria-label="Move Right"
          onTouchStart={(e) => { e.preventDefault(); updateInput('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('right', false); }}
          onMouseDown={() => updateInput('right', true)}
          onMouseUp={() => updateInput('right', false)}
          onMouseLeave={() => updateInput('right', false)}
          className={`w-14 h-14 md:w-16 md:h-16 landscape:w-12 landscape:h-12 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-[#0ea5e9] flex items-center justify-center text-[#006591] shadow-[0_8px_16px_rgba(0,101,145,0.25)] transition-all ${
            inputState.right ? 'scale-90 bg-[#c9e6ff] translate-y-1' : 'active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[32px] landscape:text-[26px]">arrow_forward</span>
        </button>
      </div>

      {/* Bottom Right: Action Buttons (Dash & Jump) */}
      <div className="flex items-center gap-3 landscape:gap-2 pointer-events-auto">
        {/* Dash Button */}
        <button
          type="button"
          aria-label="Dash"
          onTouchStart={(e) => { e.preventDefault(); updateInput('dash', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('dash', false); }}
          onMouseDown={() => updateInput('dash', true)}
          onMouseUp={() => updateInput('dash', false)}
          onMouseLeave={() => updateInput('dash', false)}
          className={`w-13 h-13 md:w-15 md:h-15 landscape:w-11 landscape:h-11 rounded-3xl bg-[#00b17b] border-2 border-white flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#006c49,0_10px_20px_rgba(0,177,123,0.35)] transition-all ${
            inputState.dash ? 'translate-y-1 shadow-none bg-[#059669]' : 'active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] landscape:text-[20px]">bolt</span>
          <span className="font-rubik text-[9px] landscape:text-[8px] font-black uppercase tracking-wider leading-none">DASH</span>
        </button>

        {/* Jump Button (Primary Large Tactile Button) */}
        <button
          type="button"
          aria-label="Jump"
          onTouchStart={(e) => { e.preventDefault(); updateInput('jump', true); }}
          onTouchEnd={(e) => { e.preventDefault(); updateInput('jump', false); }}
          onMouseDown={() => updateInput('jump', true)}
          onMouseUp={() => updateInput('jump', false)}
          onMouseLeave={() => updateInput('jump', false)}
          className={`w-16 h-16 md:w-20 md:h-20 landscape:w-14 landscape:h-14 rounded-3xl bg-[#fea619] border-2 border-white flex flex-col items-center justify-center text-[#684000] shadow-[0_8px_0_0_#855300,0_12px_24px_rgba(254,166,25,0.4)] transition-all ${
            inputState.jump ? 'translate-y-1.5 shadow-[0_2px_0_0_#855300] bg-[#f59e0b]' : 'active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[32px] landscape:text-[24px]">keyboard_double_arrow_up</span>
          <span className="font-rubik text-[11px] landscape:text-[9px] font-black uppercase tracking-wider leading-none">JUMP</span>
        </button>
      </div>
    </div>
  );
};
