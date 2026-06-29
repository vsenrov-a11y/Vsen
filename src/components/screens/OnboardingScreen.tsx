import React, { useState } from 'react';
import { StorageConfig } from '../../types';
import { saveStorageConfig } from '../../utils/storage';
import { ShieldCheck, KeyRound, ExternalLink, CheckCircle2 } from 'lucide-react';

interface OnboardingScreenProps {
  storageConfig: StorageConfig;
  onContinue: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  storageConfig,
  onContinue,
}) => {
  const [apiKey, setApiKey] = useState(storageConfig.apiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    saveStorageConfig({ apiKey: apiKey.trim() });
    setIsSaved(true);
    setTimeout(() => {
      onContinue();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto select-none animate-fadeIn">
      <div className="mt-4 font-sans">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-5 h-5 text-[#E0E0E0]" />
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">API Access</h2>
        </div>
        <p className="text-xs text-[#888888] leading-relaxed mb-6 font-normal tracking-wide">
          Connect your Google Gemini account. Your token is encrypted via local hardware storage.
        </p>

        {/* Minimal Bulleted Guide */}
        <div className="bg-white/[0.03] backdrop-blur-lg rounded-[24px] p-5 border border-white/[0.08] space-y-4 mb-6 shadow-xl">
          <div className="text-[11px] font-sans font-light uppercase tracking-wider text-[#888]">
            Quick Setup Guide
          </div>
          
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-sans font-bold text-[#E0E0E0] flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs text-[#AAA] font-normal tracking-wide leading-relaxed">
                Open <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-white font-bold underline inline-flex items-center gap-1 hover:text-[#E0E0E0]">Google AI Studio <ExternalLink className="w-3 h-3 inline" /></a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-sans font-bold text-[#E0E0E0] flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs text-[#AAA] font-normal tracking-wide leading-relaxed">
                Create a new <strong className="text-white font-bold">free Gemini API Key</strong>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-sans font-bold text-[#E0E0E0] flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs text-[#AAA] font-normal tracking-wide leading-relaxed">
                Paste your token below into secure local vault
              </div>
            </div>
          </div>
        </div>

        {/* Encrypted Badge Info */}
        <div className="flex items-center gap-2 text-[11px] text-[#888] bg-white/[0.02] backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/[0.06] font-sans font-light tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>EncryptedSharedPreferences (AES-256 GCM)</span>
        </div>
      </div>

      {/* Input Form & Action */}
      <form onSubmit={handleSaveAndContinue} className="mt-8 pt-4 font-sans">
        <label className="text-[10px] font-sans font-light uppercase tracking-widest text-[#888] mb-2 block px-1">
          Gemini API Key
        </label>
        
        <div className="relative mb-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... (or leave blank for server default)"
            className="w-full p-4 rounded-[24px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-white placeholder:text-[#555] placeholder:font-light focus:outline-none focus:border-white/[0.25] transition-all font-sans shadow-inner"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-[24px] bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-xl font-bold tracking-wide text-sm transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Key Saved Locally!</span>
            </>
          ) : (
            <span>Save & Continue</span>
          )}
        </button>
      </form>
    </div>
  );
};
