import React from 'react';
import { ChatHistory, Persona } from '../../types';
import { MessageSquare, Calendar, Trash2, ArrowRight, Bot, Sparkles } from 'lucide-react';

interface ChatHistoryScreenProps {
  chatHistories: ChatHistory[];
  personas: Persona[];
  onSelectChat: (historyId: string) => void;
  onDeleteChat: (historyId: string, e: React.MouseEvent) => void;
  onNavigateToPersonas: () => void;
}

export const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({
  chatHistories,
  personas,
  onSelectChat,
  onDeleteChat,
  onNavigateToPersonas,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto pb-24 select-none animate-fadeIn">
      <div className="w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2 mt-2 font-sans">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">Conversations</h2>
            <p className="text-xs text-[#888888] mt-0.5 font-normal tracking-wide">Your premium local chat history</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#E0E0E0]" />
          </div>
        </div>

        {/* Histories List */}
        {chatHistories.length === 0 ? (
          /* Elegant Empty State */
          <div className="mt-12 flex flex-col items-center text-center p-6 bg-white/[0.02] backdrop-blur-md rounded-[28px] border border-white/[0.06] shadow-2xl font-sans">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4 shadow-inner">
              <Bot className="w-6 h-6 text-white/30" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-sans">No Active Dialogues</h3>
            <p className="text-xs text-[#888] max-w-[200px] leading-relaxed mb-6 font-normal tracking-wide font-sans">
              Select or create a custom intelligence companion to begin secure chatting.
            </p>
            <button
              onClick={onNavigateToPersonas}
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-xl font-bold text-xs tracking-wide transition-all duration-300 active:scale-95 flex items-center gap-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] font-sans"
            >
              <span>Explore Companions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-6 font-sans">
            {chatHistories.map((chat) => {
              // Find matching persona to check if it's custom or has specific settings
              const persona = personas.find((p) => p.id === chat.personaId);
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className="p-4 rounded-[24px] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] cursor-pointer transition-all duration-300 group relative overflow-hidden font-sans"
                >
                  <div className="flex items-center gap-4">
                    {/* Companion Avatar */}
                    <div className={`w-11 h-11 rounded-[16px] bg-gradient-to-br ${chat.avatarGradient || 'from-zinc-500/20 to-zinc-700/30'} border border-white/10 flex items-center justify-center flex-shrink-0 relative shadow-inner`}>
                      <Sparkles className="w-4.5 h-4.5" />
                      {persona?.isCustom && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white/90 border border-[#1E1E1E] flex items-center justify-center text-[7px] text-[#121212] font-bold">
                          +
                        </div>
                      )}
                    </div>

                    {/* Meta info & last message */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white tracking-wide truncate font-sans">
                          {chat.personaName}
                        </div>
                        <span className="text-[9px] font-sans font-light tracking-wider text-[#666] flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {chat.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-[#888] mt-1.5 leading-relaxed truncate font-normal tracking-wide font-sans">
                        {chat.lastMessage || "Empty conversation started..."}
                      </p>
                    </div>

                    {/* Interactive Delete Trash Trigger */}
                    <button
                      onClick={(e) => onDeleteChat(chat.id, e)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#121212]/50 hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
                      title="Delete History"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info showing AES-256 validation */}
      {chatHistories.length > 0 && (
        <div className="text-[10px] text-center text-[#555] font-sans font-light tracking-widest mt-8">
          Secure Sandbox SharedPreferences Synced
        </div>
      )}
    </div>
  );
};
