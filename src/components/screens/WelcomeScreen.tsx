import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSetUp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSetUp }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn select-none">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Rounded Squircle Logo Icon */}
        <div className="w-24 h-24 bg-white/[0.03] backdrop-blur-md rounded-[32px] flex items-center justify-center mb-8 border border-white/[0.08] shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[32px]" />
          <div className="w-12 h-12 border-[2px] border-white/80 rounded-full opacity-90 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white mb-3 font-sans">
          Vsen.Ai
        </h1>
        
        <p className="text-sm text-[#888888] max-w-[240px] leading-relaxed font-normal tracking-wide font-sans">
          Your premium native Android intelligence companion, refined.
        </p>
      </div>

      {/* Glassmorphic Liquid CTA Button */}
      <div className="w-full pt-8 pb-4">
        <button
          onClick={onSetUp}
          className="w-full py-4 rounded-[24px] bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-xl font-bold tracking-wide text-sm transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-2 font-sans"
        >
          <span>Set Up App</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};
