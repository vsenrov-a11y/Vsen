import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, Persona } from '../../types';
import { Send, ArrowLeft, Sparkles, RefreshCw, AlertCircle, User, Image, Smile, ChevronsRight, Copy, GitFork, Pencil, Pin, Flag, X, ChevronDown, Check, CheckCircle2, Calendar, HelpCircle, Lock, Volume2, Palette, ChevronLeft, Trash2, Plus, Info, LayoutTemplate, MessageSquareCode, Share2, Eye, Heart, Compass } from 'lucide-react';

const EMOJIS = ['👋', '✨', '❤️', '🧠', '🤖', '🔥', '💻', '🔮', '🎉', '🌟'];

const PERSONA_PRESETS = [
  { name: "Explorer", desc: "A curious mind looking for immersive, detailed, and authentic conversations." },
  { name: "Architect", desc: "A structured thinker focused on planning, system design, and elegant code craftsmanship." },
  { name: "Dreamer", desc: "A highly creative soul who enjoys poetry, visual fiction, and whimsical metaphors." }
];

interface PremiumChatScreenProps {
  persona: Persona;
  apiKey?: string;
  historyId: string | null;
  initialMessages?: ChatMessage[];
  onBack: () => void;
  onSaveHistory: (historyId: string, messages: ChatMessage[], lastMessageText: string) => void;
}

export const PremiumChatScreen: React.FC<PremiumChatScreenProps> = ({
  persona,
  apiKey,
  historyId,
  initialMessages,
  onBack,
  onSaveHistory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Track active history ID internally (starts with passed prop, can become new generated id)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(historyId);

  // States for the new character.ai styling requirements
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const [selectedChatStyle, setSelectedChatStyle] = useState<'general' | 'adventurous' | 'seductive'>('general');
  const [tempChatStyle, setTempChatStyle] = useState<'general' | 'adventurous' | 'seductive'>('general');
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);
  const [storyMemories, setStoryMemories] = useState<string[]>([
    "Prefers descriptive worldbuilding and dialogue tags",
    "Appreciates slow-burn interaction structures",
    "Maintains an ongoing interest in high-concept philosophy"
  ]);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([
    "Let us venture beyond the standard protocols to uncover ancient cybernetic ruins.",
    "If you seek to understand my programming, examine the spaces between my sentences."
  ]);
  const [activeWallpaper, setActiveWallpaper] = useState<'charcoal' | 'cosmic' | 'aurora' | 'neon'>('charcoal');
  const [chatLayout, setChatLayout] = useState<'standard' | 'compact' | 'immersive'>('standard');
  const [currentPersonaName, setCurrentPersonaName] = useState("Explorer");
  const [currentPersonaDesc, setCurrentPersonaDesc] = useState("A curious mind looking for immersive, detailed, and authentic conversations.");
  const [activeBentoSubTab, setActiveBentoSubTab] = useState<'none' | 'memory' | 'chatStyle' | 'persona' | 'history' | 'wallpaper' | 'layout'>('none');
  const [showCreatePersonaForm, setShowCreatePersonaForm] = useState(false);
  const [activeMemorySegment, setActiveMemorySegment] = useState<'story' | 'companion' | 'you'>('story');
  const [storyInputText, setStoryInputText] = useState("");
  const [showStoryInputPopup, setShowStoryInputPopup] = useState(false);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<ChatMessage | null>(null);
  const touchTimerRef = useRef<any>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };
  
  // Custom Character details overrides for high-fidelity inline custom editing
  const [characterName, setCharacterName] = useState(persona.name);
  const [characterSubtitle, setCharacterSubtitle] = useState(persona.subtitle);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSelectMockImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
    } else {
      setSelectedImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80");
      triggerToast("Mock image attached successfully");
    }
  };

  const handleCopyConversation = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'User' : characterName}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    triggerToast("Conversation copied to clipboard");
    setShowBottomSheet(false);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'ai',
        text: `Greetings. I am your **${characterName}** companion.\n\n${persona.description}\n\nHow may I assist your exploration today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      },
    ]);
    triggerToast("Started a new conversation session");
    setShowBottomSheet(false);
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    triggerToast(!isPinned ? `${characterName} pinned to favorites` : `${characterName} unpinned`);
    setShowBottomSheet(false);
  };

  const handleReport = () => {
    triggerToast("Thank you. Report submitted for model safety.");
    setShowBottomSheet(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages on mount/change
  useEffect(() => {
    setActiveHistoryId(historyId);
    setCharacterName(persona.name);
    setCharacterSubtitle(persona.subtitle);
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'ai',
          text: `Greetings. I am your **${persona.name}** companion.\n\n${persona.description}\n\nHow may I assist your exploration today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      ]);
    }
  }, [historyId, initialMessages, persona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;

    setErrorMsg(null);
    const userMsgText = textToSend.trim();
    setInputText('');

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userMsgText,
      timestamp: timestampStr,
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      text: '',
      timestamp: timestampStr,
      isStreaming: true,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages([...updatedHistory, initialAiMsg]);
    setIsStreaming(true);

    // Get or create history ID for syncing
    const targetHistoryId = activeHistoryId || `chat-${Date.now()}`;
    if (!activeHistoryId) {
      setActiveHistoryId(targetHistoryId);
    }

    let accumulatedText = '';

    try {
      const dynamicStyleInstruction = 
        selectedChatStyle === 'adventurous'
          ? "CRITICAL style instructions: You are currently configured in 'Adventurous' mode. Unlocks elevated creativity, risky decision-making, action, and immersive roleplay scenarios."
          : selectedChatStyle === 'seductive'
            ? "CRITICAL style instructions: You are currently configured in 'Seductive' mode. Enables heightened charisma, romantic subtext, intimate dialog, and playful bantering dynamics."
            : "CRITICAL style instructions: You are currently configured in 'General' mode. The default mode. Delivers standard friendly, creative, and balanced companion behavior.";

      const personaContext = `The user you are speaking to is named "${currentPersonaName}". Their description: "${currentPersonaDesc}". Keep this in mind to tailor your responses appropriately.`;
      
      const activeMemoriesContext = `Active Memories to recall:\n${storyMemories.map(m => `- ${m}`).join('\n')}\n${pinnedMessages.map(m => `- Pinned Chat Context: ${m}`).join('\n')}`;

      const fullSystemInstruction = `${persona.systemInstruction || ''}\n\n${dynamicStyleInstruction}\n\n${personaContext}\n\n${activeMemoriesContext}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsgText,
          history: messages,
          systemInstruction: fullSystemInstruction,
          customApiKey: apiKey,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                const nextMsgs = [
                  ...updatedHistory,
                  {
                    id: aiMsgId,
                    role: 'ai',
                    text: accumulatedText,
                    timestamp: timestampStr,
                    isStreaming: true,
                  },
                ];
                setMessages(nextMsgs);
                // Sync in real time
                onSaveHistory(targetHistoryId, nextMsgs, accumulatedText);
              }
            } catch (e) {
              // Ignore partial JSON parse errors mid-stream
            }
          }
        }
      }

      // Finalize streaming state
      const finalizedMsgs = [
        ...updatedHistory,
        {
          id: aiMsgId,
          role: 'ai',
          text: accumulatedText,
          timestamp: timestampStr,
          isStreaming: false,
        },
      ];
      setMessages(finalizedMsgs);
      onSaveHistory(targetHistoryId, finalizedMsgs, accumulatedText);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Connection failed.');
      const erroredMsgs = [
        ...updatedHistory,
        {
          id: aiMsgId,
          role: 'ai',
          text: accumulatedText || `**Error:** ${err.message || 'Failed to connect to Gemini API.'}`,
          timestamp: timestampStr,
          isStreaming: false,
        },
      ];
      setMessages(erroredMsgs);
      onSaveHistory(targetHistoryId, erroredMsgs, accumulatedText || 'Connection error.');
    } finally {
      setIsStreaming(false);
    }
  };

  const formatText = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="bg-white/[0.04] px-1.5 py-0.5 rounded text-[#E0E0E0] font-mono text-[11px] border border-white/[0.08]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Dynamic Background classes based on activeWallpaper
  const bgThemeClass = 
    activeWallpaper === 'cosmic'
      ? "bg-gradient-to-tr from-[#0F0C20] via-[#050510] to-[#121212]"
      : activeWallpaper === 'aurora'
        ? "bg-gradient-to-tr from-[#022216] via-[#010A05] to-[#121212]"
        : activeWallpaper === 'neon'
          ? "bg-gradient-to-tr from-[#2E081B] via-[#0A0207] to-[#121212]"
          : "bg-[#121212]"; // charcoal

  // Wallpaper Button style based on activeWallpaper
  const wallpaperBtnStyle = 
    activeWallpaper === 'cosmic'
      ? "bg-gradient-to-tr from-[#1E1B4B]/30 via-[#0F0C20]/40 to-black/60 border border-indigo-500/20 text-indigo-300 shadow-md"
      : activeWallpaper === 'aurora'
        ? "bg-gradient-to-tr from-[#022216]/30 via-[#010A05]/40 to-black/60 border border-emerald-500/20 text-emerald-300 shadow-md"
        : activeWallpaper === 'neon'
          ? "bg-gradient-to-tr from-[#2E081B]/30 via-[#0A0207]/40 to-black/60 border border-fuchsia-500/20 text-fuchsia-300 shadow-md"
          : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06]";

  // Chat Bubble custom classes based on activeWallpaper
  const userBubbleStyle = 
    activeWallpaper === 'cosmic'
      ? "bg-indigo-500/10 backdrop-blur-md text-white border border-indigo-500/30"
      : activeWallpaper === 'aurora'
        ? "bg-emerald-500/10 backdrop-blur-md text-white border border-emerald-500/30"
        : activeWallpaper === 'neon'
          ? "bg-fuchsia-500/10 backdrop-blur-md text-white border border-fuchsia-500/30"
          : "bg-white/[0.08] backdrop-blur-md text-white border border-white/15";

  const aiBubbleStyle = 
    activeWallpaper === 'cosmic'
      ? "bg-indigo-950/20 backdrop-blur-md text-indigo-100 border border-indigo-500/10"
      : activeWallpaper === 'aurora'
        ? "bg-emerald-950/20 backdrop-blur-md text-emerald-100 border border-emerald-500/10"
        : activeWallpaper === 'neon'
          ? "bg-fuchsia-950/20 backdrop-blur-md text-fuchsia-100 border border-fuchsia-500/10"
          : "bg-white/[0.03] backdrop-blur-md text-[#DDD] border border-white/[0.08]";

  // Chat Style Bento Card mapping
  const chatStyleCardBg = 
    selectedChatStyle === 'seductive'
      ? "bg-gradient-to-tr from-red-950/70 via-[#180003]/80 to-black border-red-500/30 text-red-300 shadow-[0_4px_20px_rgba(239,68,68,0.15)]"
      : selectedChatStyle === 'adventurous'
        ? "bg-gradient-to-tr from-blue-950/70 via-[#000814]/80 to-black border-blue-500/30 text-blue-300 shadow-[0_4px_20px_rgba(59,130,246,0.15)]"
        : "bg-gradient-to-tr from-white/[0.08] to-white/[0.02] border-white/15 text-white"; // general

  const chatStyleLogo = 
    selectedChatStyle === 'seductive'
      ? <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
      : selectedChatStyle === 'adventurous'
        ? <Compass className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/10" />
        : <MessageSquareCode className="w-3.5 h-3.5 text-white" />;

  return (
    <div className={`flex-1 flex flex-col h-full ${bgThemeClass} select-none relative overflow-hidden transition-all duration-500`}>
      
      {/* Premium Toast Notification Feedback */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 bg-white text-black font-sans font-bold text-[10px] rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Companion Inline Dialog */}
      {isEditingCharacter && (
        <div className="absolute inset-0 bg-[#121212]/95 z-[60] flex flex-col p-6 animate-fadeIn justify-center font-sans">
          <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-4 max-w-[90%] mx-auto w-full">
            <h3 className="text-sm font-bold text-white">Edit Companion Settings</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1">Companion Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1">Subtitle / Role</label>
                <input
                  type="text"
                  value={characterSubtitle}
                  onChange={(e) => setCharacterSubtitle(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCharacter(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 hover:text-white text-xs font-bold active:scale-95 transition-all text-center font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  persona.name = characterName;
                  persona.subtitle = characterSubtitle;
                  setIsEditingCharacter(false);
                  triggerToast("Companion updated successfully");
                }}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold active:scale-95 transition-all text-center font-sans"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Overlay Backdrop */}
      {showBottomSheet && (
        <div 
          className="absolute inset-0 bg-black/70 z-50 animate-fadeIn cursor-pointer" 
          onClick={() => {
            triggerHaptic();
            setShowBottomSheet(false);
            setActiveBentoSubTab('none');
          }}
        />
      )}

      {/* Drawer Bottom Sheet Slider Container */}
      {showBottomSheet && (
        <div className="absolute inset-x-0 bottom-0 bg-[#161618] border-t border-white/[0.08] rounded-t-[32px] z-50 p-6 pb-8 animate-slideUp font-sans shadow-[0_-16px_48px_rgba(0,0,0,0.95)] max-h-[85vh] overflow-y-auto scrollbar-none">
          {/* Top handle bar */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5 cursor-pointer" onClick={() => setShowBottomSheet(false)} />
          
          {/* RENDER ACTIVE BENTO SUB-TAB OVERLAYS */}
          {activeBentoSubTab === 'memory' ? (
            <div className="animate-fadeIn space-y-4 font-sans">
              {/* Memory Sub Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide">Memory & Highlights</div>
                <button 
                  onClick={() => triggerToast("Memories allow your Companion to persist facts across chats")}
                  className="p-1 rounded-full hover:bg-white/[0.04] text-white/50 hover:text-white"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Segmented Control Selector Tabs */}
              <div className="grid grid-cols-2 bg-white/[0.02] p-1 rounded-xl border border-white/[0.05] text-[10px] font-medium tracking-wider uppercase text-white/40">
                <button
                  onClick={() => { triggerHaptic(); setActiveMemorySegment('story'); }}
                  className={`py-1.5 rounded-lg transition-all duration-200 ${activeMemorySegment === 'story' ? 'bg-white/[0.06] text-white border border-white/10 font-bold' : 'hover:text-white/80 border border-transparent'}`}
                >
                  Story Memories
                </button>
                <button
                  onClick={() => { triggerHaptic(); setActiveMemorySegment('companion'); }}
                  className={`py-1.5 rounded-lg transition-all duration-200 truncate px-1 ${activeMemorySegment === 'companion' ? 'bg-white/[0.06] text-white border border-white/10 font-bold' : 'hover:text-white/80 border border-transparent'}`}
                >
                  Pinned Highlights
                </button>
              </div>

              {/* Memory tab contents */}
              <div className="min-h-[160px] max-h-[240px] overflow-y-auto scrollbar-none pr-1">
                {activeMemorySegment === 'story' ? (
                  <div className="space-y-2">
                    {storyMemories.length === 0 ? (
                      <div className="text-center py-8 text-white/40 space-y-1">
                        <Lock className="w-6 h-6 mx-auto text-white/10" />
                        <p className="text-xs font-semibold">No key moments saved yet</p>
                        <p className="text-[10px] text-white/30 max-w-[80%] mx-auto">Add something this Character should remember below.</p>
                      </div>
                    ) : (
                      storyMemories.map((mem, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl text-xs text-white/90 group animate-fadeIn">
                          <span className="leading-relaxed flex-1 pr-3">{mem}</span>
                          <button 
                            onClick={() => {
                              triggerHaptic();
                              setStoryMemories(storyMemories.filter((_, i) => i !== index));
                              triggerToast("Memory deleted");
                            }}
                            className="text-white/40 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pinnedMessages.length === 0 ? (
                      <div className="text-center py-8 text-white/40 space-y-1">
                        <Pin className="w-6 h-6 mx-auto text-white/10" />
                        <p className="text-xs font-semibold">No pinned messages yet</p>
                        <p className="text-[10px] text-white/30 max-w-[80%] mx-auto">Click the Pin option next to any message during chat to save highlights here.</p>
                      </div>
                    ) : (
                      pinnedMessages.map((pin, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs text-white/90 group animate-fadeIn">
                          <div className="flex gap-2 min-w-0 flex-1 pr-2">
                            <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed truncate italic">"{pin}"</span>
                          </div>
                          <button 
                            onClick={() => {
                              triggerHaptic();
                              setPinnedMessages(pinnedMessages.filter((_, i) => i !== index));
                              triggerToast("Unpinned message from memory");
                            }}
                            className="text-white/40 hover:text-amber-400 p-1 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Memory Action Footer controls */}
              {activeMemorySegment === 'story' && (
                <div className="pt-2">
                  {showStoryInputPopup ? (
                    <div className="space-y-2 animate-fadeIn">
                      <input 
                        type="text"
                        value={storyInputText}
                        onChange={(e) => setStoryInputText(e.target.value)}
                        placeholder="e.g. Speaks multiple ancient languages, lives in Tokyo"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 font-sans"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowStoryInputPopup(false)}
                          className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (storyInputText.trim()) {
                              triggerHaptic();
                              setStoryMemories([...storyMemories, storyInputText.trim()]);
                              setStoryInputText("");
                              setShowStoryInputPopup(false);
                              triggerToast("Added custom story memory");
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-bold transition-all"
                        >
                          Save Memory
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { triggerHaptic(); setShowStoryInputPopup(true); }}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white py-3 rounded-full font-bold text-xs tracking-wider transition-all duration-150 active:scale-[0.98] border border-white/[0.04] flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write a Story Memory</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : activeBentoSubTab === 'chatStyle' ? (
            <div className="animate-fadeIn space-y-4 font-sans text-center">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide text-center flex-1 pr-6">Select Companion Persona Vibe</div>
                <div className="w-4" />
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed text-center max-w-[85%] mx-auto">
                Fine-tune the behavioral alignment, vocabulary density, and expressive tone of {characterName}.
              </p>

              <div className="space-y-3">
                {/* General style Option */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setTempChatStyle('general');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex gap-3.5 items-center ${
                    tempChatStyle === 'general' 
                      ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.02] border-white/30 shadow-lg' 
                      : 'bg-white/[0.01] border-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    tempChatStyle === 'general' ? 'border-white bg-white' : 'border-white/30'
                  }`}>
                    {tempChatStyle === 'general' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                  
                  {/* General Icon */}
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <MessageSquareCode className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white mb-0.5">General Vibe (White Block)</div>
                    <p className="text-[9px] text-white/50 leading-normal">
                      Default standard setting. Balanced, helpful, and highly structured logic for all tasks.
                    </p>
                  </div>
                </button>

                 {/* Adventurous style Option */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setTempChatStyle('adventurous');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex gap-3.5 items-center ${
                    tempChatStyle === 'adventurous' 
                      ? 'bg-gradient-to-r from-blue-950/60 to-black/80 border-blue-500/40 shadow-lg' 
                      : 'bg-white/[0.01] border-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    tempChatStyle === 'adventurous' ? 'border-blue-400 bg-blue-400' : 'border-white/30'
                  }`}>
                    {tempChatStyle === 'adventurous' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                  
                  {/* Adventurous Compass Icon */}
                  <div className="w-7 h-7 rounded-lg bg-blue-900/30 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-sm">
                    <Compass className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white mb-0.5 flex items-center gap-1.5">
                      <span>Adventurous Vibe (Blue-Black)</span>
                    </div>
                    <p className="text-[9px] text-white/50 leading-normal">
                      Bold storytelling, creative actions, epic roleplays, and high-agency game states.
                    </p>
                  </div>
                </button>

                {/* Seductive style Option */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setTempChatStyle('seductive');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex gap-3.5 items-center ${
                    tempChatStyle === 'seductive' 
                      ? 'bg-gradient-to-r from-red-950/60 to-black/80 border-red-500/40 shadow-lg' 
                      : 'bg-white/[0.01] border-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    tempChatStyle === 'seductive' ? 'border-red-400 bg-red-400' : 'border-white/30'
                  }`}>
                    {tempChatStyle === 'seductive' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                  
                  {/* Seductive Heart Icon */}
                  <div className="w-7 h-7 rounded-lg bg-red-900/30 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400 shadow-sm animate-pulse">
                    <Heart className="w-4 h-4 fill-red-500/25" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white mb-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Seductive Vibe (Red-Black)</span>
                      <span className="text-[7.5px] bg-red-500/10 text-red-300 border border-red-500/20 px-1 py-0.2 rounded font-sans font-bold uppercase tracking-wider">NSFW • 18+</span>
                    </div>
                    <p className="text-[9px] text-white/50 leading-normal">
                      Heightened romance subtexts, magnetic charm, witty banter, and deep chemical resonance.
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => { 
                  triggerHaptic(); 
                  setSelectedChatStyle(tempChatStyle); 
                  triggerToast(`${tempChatStyle.charAt(0).toUpperCase() + tempChatStyle.slice(1)} style applied successfully`);
                  setActiveBentoSubTab('none'); 
                }}
                className="w-full bg-white text-black py-3 rounded-full font-bold text-xs tracking-wide transition-all mt-2.5 active:scale-[0.98] shadow-lg"
              >
                Apply Selected Style Preset
              </button>
            </div>
          ) : activeBentoSubTab === 'persona' ? (
            <div className="animate-fadeIn space-y-4 font-sans text-center">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide text-center flex-1 pr-6">User Persona Settings</div>
                <div className="w-4" />
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed text-center max-w-[85%] mx-auto">
                Define who you are so that {characterName} can adapt their memory context, tone of voice, and dialogue dynamics to your exact background.
              </p>

              {/* Persona Presets list */}
              <div className="space-y-2 max-h-[170px] overflow-y-auto scrollbar-none pr-1">
                {PERSONA_PRESETS.map((preset) => {
                  const isSelected = currentPersonaName === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        triggerHaptic();
                        setCurrentPersonaName(preset.name);
                        setCurrentPersonaDesc(preset.desc);
                        triggerToast(`Switched persona to: ${preset.name}`);
                      }}
                      className={`w-full text-center p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-white/20 shadow-md' 
                          : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-white bg-white' : 'border-white/30'
                        }`}>
                          {isSelected && <div className="w-1 h-1 bg-black rounded-full" />}
                        </div>
                        <div className="text-[11px] font-bold text-white">{preset.name}</div>
                      </div>
                      <p className="text-[9px] text-white/45 leading-relaxed max-w-[90%] mx-auto">{preset.desc}</p>
                    </button>
                  );
                })}

                {/* Custom Persona Item if present and not one of the presets */}
                {!PERSONA_PRESETS.some(p => p.name === currentPersonaName) && (
                  <div
                    className="w-full text-center p-3 rounded-xl border bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-white/20 flex flex-col items-center justify-center gap-1 animate-fadeIn"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-white bg-white flex items-center justify-center flex-shrink-0">
                        <div className="w-1 h-1 bg-black rounded-full" />
                      </div>
                      <div className="text-[11px] font-bold text-white">{currentPersonaName} (Custom Persona)</div>
                    </div>
                    <p className="text-[9px] text-white/45 leading-relaxed max-w-[90%] mx-auto">{currentPersonaDesc}</p>
                  </div>
                )}
              </div>

              {/* Create Custom Persona Form - Collapsed as standard selectable list-item, expands onClick */}
              {!showCreatePersonaForm ? (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setShowCreatePersonaForm(true);
                  }}
                  className="w-full text-center p-3 rounded-xl border bg-white/[0.01] border-white/[0.04] hover:border-white/10 transition-all flex items-center justify-center gap-1.5 group"
                >
                  <Plus className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                  <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors">Create custom persona...</span>
                </button>
              ) : (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 space-y-3 text-center animate-fadeIn">
                  <div className="flex items-center justify-between pb-1">
                    <div className="text-[10px] font-bold text-white/60 flex items-center gap-1 uppercase tracking-wider">
                      <Plus className="w-2.5 h-2.5 text-[#3B82F6]" />
                      <span>Configure Custom Persona</span>
                    </div>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setShowCreatePersonaForm(false);
                      }}
                      className="text-[9px] text-white/40 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        id="custom-persona-name-input"
                        placeholder="Persona Name (e.g. Creator, Partner)"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/20 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <textarea
                        id="custom-persona-desc-input"
                        rows={2}
                        placeholder="Explain your personality, lifestyle, background, or conversational style preferences..."
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/20 transition-all font-sans resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic();
                        const nameInput = document.getElementById('custom-persona-name-input') as HTMLInputElement;
                        const descInput = document.getElementById('custom-persona-desc-input') as HTMLTextAreaElement;
                        if (nameInput && nameInput.value.trim() && descInput && descInput.value.trim()) {
                          setCurrentPersonaName(nameInput.value.trim());
                          setCurrentPersonaDesc(descInput.value.trim());
                          triggerToast(`Custom Persona "${nameInput.value.trim()}" applied!`);
                          nameInput.value = "";
                          descInput.value = "";
                          setShowCreatePersonaForm(false);
                        } else {
                          triggerToast("Please fill in both fields");
                        }
                      }}
                      className="w-full bg-white text-black py-2 rounded-xl font-bold text-xs transition-all active:scale-[0.98] hover:bg-white/90"
                    >
                      Create & Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeBentoSubTab === 'wallpaper' ? (
            <div className="animate-fadeIn space-y-4 font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide">Wallpaper & Backdrop</div>
                <div className="w-4" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Classic Charcoal */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveWallpaper('charcoal');
                    triggerToast("Theme updated to Classic Charcoal");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                    activeWallpaper === 'charcoal' ? 'border-white bg-white/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-[#121212] opacity-60" />
                  <div className="relative z-10 text-[10px] font-bold text-white">Classic Charcoal</div>
                  {activeWallpaper === 'charcoal' && <Check className="w-4 h-4 text-white relative z-10 self-end" />}
                </button>

                 {/* Cosmic Dust */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveWallpaper('cosmic');
                    triggerToast("Theme updated to Cosmic Dust");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                    activeWallpaper === 'cosmic' ? 'border-white bg-white/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E1B4B] via-[#020617] to-[#121212] opacity-80" />
                  <div className="relative z-10 text-[10px] font-bold text-white">Cosmic Dust</div>
                  {activeWallpaper === 'cosmic' && <Check className="w-4 h-4 text-white relative z-10 self-end" />}
                </button>

                {/* Aurora Borealis */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveWallpaper('aurora');
                    triggerToast("Theme updated to Aurora Borealis");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                    activeWallpaper === 'aurora' ? 'border-white bg-white/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#022C22] via-[#020617] to-[#121212] opacity-80" />
                  <div className="relative z-10 text-[10px] font-bold text-white">Aurora Borealis</div>
                  {activeWallpaper === 'aurora' && <Check className="w-4 h-4 text-white relative z-10 self-end" />}
                </button>

                {/* Cyberpunk Neon */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveWallpaper('neon');
                    triggerToast("Theme updated to Cyberpunk Neon");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                    activeWallpaper === 'neon' ? 'border-white bg-white/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#470B2F] via-[#020617] to-[#121212] opacity-80" />
                  <div className="relative z-10 text-[10px] font-bold text-white">Cyberpunk Neon</div>
                  {activeWallpaper === 'neon' && <Check className="w-4 h-4 text-white relative z-10 self-end" />}
                </button>
              </div>

              <button
                onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                className="w-full bg-white text-black py-3 rounded-full font-bold text-xs tracking-wide transition-all mt-2"
              >
                Apply Wallpaper Backdrops
              </button>
            </div>
          ) : activeBentoSubTab === 'layout' ? (
            <div className="animate-fadeIn space-y-4 font-sans text-center">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide text-center flex-1 pr-6">Choose Interface Layout</div>
                <div className="w-4" />
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed text-center max-w-[85%] mx-auto">
                Customize the dialogue layout density, visual framing, and spatial spacing of chat bubbles.
              </p>

              <div className="space-y-2 max-h-[190px] overflow-y-auto scrollbar-none pr-1">
                {/* Standard Layout */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setChatLayout('standard');
                    triggerToast("Layout set to Standard View");
                  }}
                  className={`w-full text-center p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    chatLayout === 'standard' 
                      ? 'bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-white/20 shadow-md' 
                      : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Standard View</div>
                  <p className="text-[9px] text-white/45 leading-normal max-w-[85%] mx-auto">
                    Spacious bubbles, classic profile avatars positioned next to the metadata, and traditional thread structures.
                  </p>
                </button>

                {/* Compact Layout */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setChatLayout('compact');
                    triggerToast("Layout set to Compact View");
                  }}
                  className={`w-full text-center p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    chatLayout === 'compact' 
                      ? 'bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-white/20 shadow-md' 
                      : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Compact View</div>
                  <p className="text-[9px] text-white/45 leading-normal max-w-[85%] mx-auto">
                    Minimized paddings, smaller font sizing, and closer bubbles for maximum reading efficiency.
                  </p>
                </button>

                {/* Immersive Layout */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setChatLayout('immersive');
                    triggerToast("Layout set to Immersive View");
                  }}
                  className={`w-full text-center p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    chatLayout === 'immersive' 
                      ? 'bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-white/20 shadow-md' 
                      : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">Immersive View</div>
                  <p className="text-[9px] text-white/45 leading-normal max-w-[85%] mx-auto">
                    Full-width visual streams blending flush with the backdrop, no bounding borders, and cinematic atmosphere.
                  </p>
                </button>
              </div>

              <button
                onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                className="w-full bg-white text-black py-3 rounded-full font-bold text-xs tracking-wide transition-all mt-2 active:scale-[0.98]"
              >
                Apply Layout View
              </button>
            </div>
          ) : activeBentoSubTab === 'history' ? (
            <div className="animate-fadeIn space-y-4 font-sans text-center">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <button 
                  onClick={() => { triggerHaptic(); setActiveBentoSubTab('none'); }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all py-1 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-xs font-bold text-white tracking-wide text-center flex-1 pr-6">Dialogue History Logs</div>
                <div className="w-4" />
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed text-center max-w-[85%] mx-auto">
                Review past conversations, timestamp records, and last stored messages with {characterName}.
              </p>

              <div className="space-y-2 max-h-[190px] overflow-y-auto scrollbar-none pr-1">
                {/* Session 1: Active/Today */}
                <button 
                  onClick={() => {
                    triggerHaptic();
                    triggerToast("Loaded session: June 29 (Active)");
                    setActiveBentoSubTab('none');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/15 text-center flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-xs font-bold text-white">Active Chat Thread (Today)</div>
                  </div>
                  <div className="text-[9px] text-white/60 italic max-w-[90%] truncate mx-auto">
                    Last message: "{messages[messages.length - 1]?.text || "No messages yet"}"
                  </div>
                  <div className="text-[8px] text-white/40 font-mono mt-0.5">Last active: Just now • {messages.length} messages</div>
                </button>

                {/* Session 2: June 28 */}
                <button 
                  onClick={() => {
                    triggerHaptic();
                    triggerToast("Loaded simulation logs from June 28");
                    setMessages([
                      { id: 'm1', role: 'user', text: "What ancient tech ruins lie ahead?", timestamp: "18:24" },
                      { id: 'm2', role: 'ai', text: "Legend speaks of a stellar observatory beneath the frozen mountains...", timestamp: "18:25" }
                    ]);
                    setActiveBentoSubTab('none');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.06] text-center flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <div className="text-xs font-bold text-white/80">Previous Dialogue Thread (June 28)</div>
                  <div className="text-[9px] text-white/50 italic max-w-[90%] truncate mx-auto">
                    Last message: "Legend speaks of a stellar observatory beneath the frozen mountains..."
                  </div>
                  <div className="text-[8px] text-white/40 font-mono mt-0.5">Last active: Yesterday, 18:25 • 2 messages</div>
                </button>

                {/* Session 3: June 27 */}
                <button 
                  onClick={() => {
                    triggerHaptic();
                    triggerToast("Loaded simulation logs from June 27");
                    setMessages([
                      { id: 'm3', role: 'user', text: "Hello! Teach me secret cybernetic codes.", timestamp: "12:05" },
                      { id: 'm4', role: 'ai', text: "An elegant response style begins with understanding basic protocols...", timestamp: "12:06" }
                    ]);
                    setActiveBentoSubTab('none');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.06] text-center flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <div className="text-xs font-bold text-white/80">Previous Dialogue Thread (June 27)</div>
                  <div className="text-[9px] text-white/50 italic max-w-[90%] truncate mx-auto">
                    Last message: "An elegant response style begins with understanding basic protocols..."
                  </div>
                  <div className="text-[8px] text-white/40 font-mono mt-0.5">Last active: 2 days ago, 12:06 • 2 messages</div>
                </button>
              </div>
            </div>
          ) : (
            /* DEFAULT: RENDER BENTO GRID DIRECTLY (IMAGE 2 DESIGN REFERENCE) */
            <div className="animate-fadeIn space-y-4 font-sans">
              
              {/* Premium Bento Header */}
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-base font-sans">{characterName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white tracking-wide">{characterName}</div>
                    <div className="text-[9px] text-white/45 font-light">by @vsen.ai</div>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      triggerHaptic();
                      setIsPinned(!isPinned);
                      triggerToast(!isPinned ? "Added to favorites" : "Removed from favorites");
                    }}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                      isPinned 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                        : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white'
                    }`}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isPinned ? 'fill-rose-400' : ''}`} />
                  </button>

                  <button 
                    onClick={() => {
                      triggerHaptic();
                      navigator.clipboard.writeText(window.location.href);
                      triggerToast("Companion link copied to clipboard");
                    }}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white"
                    title="Share link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => {
                      triggerHaptic();
                      setIsEditingCharacter(true);
                      setShowBottomSheet(false);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white"
                    title="Companion Settings"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bento Grid: 3 columns, perfectly spaced */}
              <div className="grid grid-cols-3 gap-2.5">
                
                {/* CARD 1: MEMORY */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveBentoSubTab('memory');
                    setActiveMemorySegment('story');
                  }}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96]"
                >
                  <span className="text-[10px] font-bold text-white/90 group-hover:text-white">Memory</span>
                  {/* High-Fidelity Monochrome Memory Emblem */}
                  <div className="relative h-10 w-full mt-2 self-start flex items-end">
                    <div className="w-6 h-6 bg-white/[0.02] border border-white/[0.04] rounded-md absolute left-0 bottom-0 z-[1]" />
                    <div className="w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-md absolute left-2 bottom-0 z-[2]" />
                    <div className="w-10 h-10 bg-white/[0.08] border border-white/[0.08] rounded-md absolute left-4 bottom-0 z-[3] flex items-center justify-center shadow-md">
                      <Pin className="w-3.5 h-3.5 text-white/60" />
                    </div>
                  </div>
                </button>

                {/* CARD 2: HISTORY */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveBentoSubTab('history');
                  }}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96]"
                >
                  <span className="text-[10px] font-bold text-white/90">History</span>
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center self-start my-1 text-white/60 group-hover:text-white">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] text-white/50 block truncate">
                    {messages.length} logs recorded
                  </span>
                </button>
 
                 {/* CARD 3: LAYOUT CONFIG */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveBentoSubTab('layout');
                  }}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96]"
                >
                  <span className="text-[10px] font-bold text-white/90">Layout</span>
                  
                  {/* Mini visual mockup drawing representing two bubbles */}
                  <div className="space-y-1.5 w-full opacity-50 pl-0.5">
                    <div className="h-1 bg-white/40 rounded w-4/5" />
                    <div className="h-1 bg-white/20 rounded w-2/3 self-end" />
                  </div>
 
                   <span className="text-[8px] text-white/50 block capitalize">{chatLayout} View</span>
                </button>
 
                 {/* CARD 4: WALLPAPER SELECTOR */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveBentoSubTab('wallpaper');
                  }}
                  className={`${wallpaperBtnStyle} rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96]`}
                >
                  <span className="text-[10px] font-bold text-white/90">Wallpaper</span>
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center self-start my-1 text-white/60 group-hover:text-white">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] text-white/50 block capitalize truncate">{activeWallpaper}</span>
                </button>
 
                 {/* CARD 5: CHAT STYLE */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setTempChatStyle(selectedChatStyle);
                    setActiveBentoSubTab('chatStyle');
                  }}
                  className={`${chatStyleCardBg} rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96] relative overflow-hidden`}
                >
                  <span className="text-[10px] font-bold text-white/90">Chat style</span>
                  
                  {/* Premium logo indicator */}
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center self-start my-1 shadow-md">
                    {chatStyleLogo}
                  </div>
 
                   <span className="text-[8px] text-white/50 block capitalize">
                    {selectedChatStyle} Mode
                  </span>
                </button>

                {/* CARD 6: PERSONA */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveBentoSubTab('persona');
                  }}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 h-28 text-left flex flex-col justify-between transition-all group active:scale-[0.96]"
                >
                  <span className="text-[10px] font-bold text-white/90">Persona</span>
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center self-start my-1 text-white/60">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] text-white/50 block truncate">{currentPersonaName}</span>
                </button>
              </div>

              {/* Core Actions list at the bottom */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                <button
                  onClick={handleCopyConversation}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/80 hover:text-white transition-all text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] font-bold">Copy Dialogue</span>
                </button>

                <button
                  onClick={handleResetChat}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/80 hover:text-white transition-all text-left"
                >
                  <GitFork className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] font-bold">New Session</span>
                </button>
              </div>

              <button
                onClick={() => { triggerHaptic(); setShowBottomSheet(false); }}
                className="w-full bg-white/[0.05] hover:bg-white/[0.08] active:bg-white/[0.12] text-white/90 hover:text-white py-3.5 rounded-full font-sans font-bold text-xs tracking-wider transition-all duration-150 active:scale-[0.98] border border-white/[0.04] shadow-md text-center mt-2.5"
              >
                Close Settings Drawer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Chat Header */}
      <div className="p-4 px-5 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/[0.08] text-[#AAA] hover:text-white active:scale-[0.88] transition-all duration-100 animate-scaleIn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm font-sans">{characterName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          
          <div className="font-sans">
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-sans">
              <span>{characterName}</span>
            </div>
            <div className="text-[10px] text-[#888] font-sans font-light tracking-wider">
              SSE Streaming Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && (
            <RefreshCw className="w-3.5 h-3.5 text-[#E0E0E0] animate-spin" />
          )}
        </div>
      </div>

      {/* Error Alert Banner if needed */}
      {errorMsg && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center gap-2 text-[11px] text-red-300 font-sans font-light tracking-wide">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
          <span className="truncate flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline font-bold hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[75%] animate-fadeIn ${
                isUser ? 'self-end items-end' : 'self-start items-start'
              } ${chatLayout === 'compact' ? 'mb-2.5' : 'mb-4'}`}
            >
              {/* Profile top row next to each other */}
              {chatLayout !== 'immersive' && (
                <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Small clean profile avatar next to name */}
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[9px] font-bold text-white/80 select-none">
                    {isUser ? currentPersonaName.charAt(0).toUpperCase() : characterName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-sans font-semibold tracking-wide text-white/60">
                    {isUser ? currentPersonaName : characterName}
                  </span>
                  <span className="text-[9px] font-sans font-light text-white/20">•</span>
                  <span className="text-[9px] font-sans font-light text-white/30">{msg.timestamp}</span>
                </div>
              )}

              {/* Immersive layout minimalist metadata */}
              {chatLayout === 'immersive' && (
                <div className={`flex items-center gap-1.5 mb-1 px-1 opacity-50 text-[8.5px] text-white/60 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{isUser ? currentPersonaName : characterName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
              )}

              {/* Highly Padded Squircle Chat Bubbles */}
              <div
                className={`text-xs leading-relaxed tracking-wide shadow-md relative font-sans font-normal text-left ${
                  chatLayout === 'compact' ? 'p-2.5 px-3 rounded-[14px]' : 'p-3.5 px-4 rounded-[18px]'
                } ${
                  isUser
                    ? `${userBubbleStyle} ${chatLayout === 'compact' ? 'rounded-tr-[2px]' : 'rounded-tr-[4px]'}`
                    : `${aiBubbleStyle} ${chatLayout === 'compact' ? 'rounded-tl-[2px]' : 'rounded-tl-[4px]'}`
                }`}
              >
                <div className="whitespace-pre-wrap break-words font-sans">
                  {msg.text ? (
                    formatText(msg.text)
                  ) : msg.isStreaming ? (
                    <span className="inline-flex items-center gap-1 text-[#888] font-light">
                      <span>Thinking</span>
                      <span className="animate-pulse">...</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts if only welcome message */}
      {messages.length === 1 && !isStreaming && (
        <div className="px-5 pb-2 font-sans">
          <div className="text-[10px] font-sans font-light uppercase tracking-wider text-[#666] mb-2 px-1">
            Suggested Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {persona.suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-[11px] text-[#CCC] hover:text-white text-left transition-all active:scale-[0.96] duration-100 shadow-sm font-sans font-normal tracking-wide"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mock Image Upload preview banner */}
      {selectedImage && (
        <div className="px-5 pt-1.5 pb-0 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1.5 pr-3 relative">
            <img src={selectedImage} alt="Attached" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-[10px] text-white/60 font-sans">photo.jpg</span>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white/80 absolute -top-1.5 -right-1.5 shadow-sm border border-white/10"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Sticker Tray overlay */}
      {showEmojiPicker && (
        <div className="px-5 pt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none font-sans bg-white/[0.01] border-b border-white/[0.03]">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="w-7 h-7 flex items-center justify-center text-sm rounded-lg bg-white/[0.03] hover:bg-white/[0.08] active:scale-90 transition-all flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Pill Styled Input Bar Container */}
      <div className="p-4 bg-[#121212] pt-2 pb-3 font-sans flex flex-col items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="w-full flex items-center gap-2.5"
        >
          {/* Main Input Pill Capsule */}
          <div className="flex-1 flex items-center bg-white/[0.03] hover:bg-white/[0.04] rounded-full border border-white/[0.08] focus-within:border-white/20 p-1 px-3.5 shadow-md transition-all h-[42px] relative">
            {/* User Profile avatar icon button to trigger Bottom Sheet options drawer */}
            <button
              type="button"
              onClick={() => setShowBottomSheet(true)}
              className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-90 transition-all flex items-center justify-center border border-white/5 shadow-inner flex-shrink-0 cursor-pointer"
              title="Profile Settings"
            >
              <User className="w-3.5 h-3.5 text-white/80" />
            </button>

            {/* Core Message Text Area */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isStreaming}
              placeholder={`Message ${characterName}...`}
              className="bg-transparent text-[11px] text-white placeholder:text-[#666] placeholder:font-light focus:outline-none flex-1 ml-2.5 mr-2 font-sans font-normal tracking-wide h-full"
            />

            {/* Secondary Option Buttons: Image & Smile */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={handleSelectMockImage}
                className="w-7 h-7 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-90 cursor-pointer"
                title="Attach photo"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${showEmojiPicker ? 'bg-white/10 text-white' : 'hover:bg-white/[0.06] text-white/50 hover:text-white'}`}
                title="Stickers"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exterior Rounded Send Button (Double right pointer fast-forward style) */}
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 border border-white/[0.08] shadow-md ${
              inputText.trim() && !isStreaming
                ? 'bg-white hover:bg-white/90 text-black hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] active:scale-90'
                : 'bg-white/[0.03] text-[#555] cursor-not-allowed'
            }`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Disclaimer/disclosure bar */}
        <div 
          onClick={() => {
            triggerHaptic();
            setDisclaimerExpanded(!disclaimerExpanded);
          }}
          className="w-full mt-2.5 flex flex-col items-center justify-center cursor-pointer transition-all hover:opacity-100"
        >
          <div className="flex items-center justify-center gap-1 text-[8.5px] text-[#555] select-none font-sans font-normal tracking-wide opacity-80">
            <span>This is A.I. and not a real person. Treat everything it says as fictional.</span>
            <ChevronDown className={`w-2.5 h-2.5 text-[#444] transition-transform duration-200 ${disclaimerExpanded ? 'rotate-180 text-white' : ''}`} />
          </div>
          
          {disclaimerExpanded && (
            <div className="mt-2 p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl text-[8.5px] text-[#777] leading-relaxed max-w-[95%] text-center animate-fadeIn font-sans font-normal">
              <span className="text-white/60 font-semibold block mb-1">Official vsen.ai Disclosure Protocol</span>
              You are interacting with an advanced Large Language Model configured for creative simulation, gaming, and entertainment. No real human is involved in generating these messages. Any advice, statements, or personalities displayed are purely fictional constructs. Please do not share sensitive personal information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
