import React from 'react';
import { MainTabType } from '../types';
import { Home, MessageSquare, User } from 'lucide-react';

interface GlassDockProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export const GlassDock: React.FC<GlassDockProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personas', icon: Home, label: 'Home' },
    { id: 'history', icon: MessageSquare, label: 'Chats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-white/[0.06] py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] flex justify-center">
      <div className="w-[85%] max-w-[240px] h-[34px] flex items-center justify-between relative px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="w-14 h-full flex justify-center items-center relative group outline-none active:scale-[0.88] transition-transform duration-150 rounded-lg"
              title={tab.label}
            >
              {/* Organic/Squircle Capsule Highlight for active tab */}
              {isActive && (
                <div 
                  className="absolute inset-0 bg-white/[0.06] border border-white/5 rounded-lg animate-scaleIn"
                  style={{ borderRadius: '8px' }}
                />
              )}

              {/* Icon with scaling & interactive colors */}
              <div className="relative z-10 transition-all duration-300">
                <Icon 
                  className={`w-[16px] h-[16px] transition-all duration-300 ${
                    isActive 
                      ? 'text-white scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                      : 'text-white/40 group-hover:text-white/75'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
