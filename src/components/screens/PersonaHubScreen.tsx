import React, { useState } from 'react';
import { Persona } from '../../types';
import { PERSONAS } from '../../data/personas';
import { Search, Bell, Sparkles, Check, ArrowRight, PlusCircle, User, Bot, Heart } from 'lucide-react';

interface PersonaHubScreenProps {
  selectedPersonaId: string;
  customPersonas: Persona[];
  likedPersonaIds: string[];
  onSelectPersona: (persona: Persona) => void;
  onStartChat: () => void;
  onCreateCustomPersona: (newPersona: Persona) => void;
  onToggleLikePersona: (personaId: string) => void;
}

type CategoryType = 'foryou' | 'following' | 'trending' | 'specialists' | 'create';

export const PersonaHubScreen: React.FC<PersonaHubScreenProps> = ({
  selectedPersonaId,
  customPersonas,
  likedPersonaIds = [],
  onSelectPersona,
  onStartChat,
  onCreateCustomPersona,
  onToggleLikePersona,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('foryou');
  const [searchQuery, setSearchQuery] = useState('');

  // Fields for Custom Character Creator
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'blue' | 'purple' | 'emerald' | 'amber'>('purple');

  const handleCreatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemInstruction.trim()) return;

    let avatarGradient = 'from-purple-500/20 to-pink-500/30 border-purple-400/30 text-purple-300';
    let accentColor = '#D946EF';

    if (selectedTheme === 'blue') {
      avatarGradient = 'from-blue-500/20 to-cyan-500/30 border-blue-400/30 text-blue-300';
      accentColor = '#3B82F6';
    } else if (selectedTheme === 'emerald') {
      avatarGradient = 'from-emerald-500/20 to-teal-500/30 border-emerald-400/30 text-emerald-300';
      accentColor = '#10B981';
    } else if (selectedTheme === 'amber') {
      avatarGradient = 'from-amber-500/20 to-orange-500/30 border-amber-400/30 text-amber-300';
      accentColor = '#F59E0B';
    }

    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || 'Custom Companion',
      description: description.trim() || 'Custom instruction companion.',
      systemInstruction: systemInstruction.trim(),
      avatarGradient,
      accentColor,
      creator: '@you',
      chatsCount: '0',
      suggestedPrompts: [
        `Introduce yourself, ${name.trim()}.`,
        `What are your system parameters?`,
        `How can you help me?`
      ],
      isCustom: true,
    };

    onCreateCustomPersona(newPersona);
    
    // Reset fields
    setName('');
    setSubtitle('');
    setSystemInstruction('');
    setDescription('');
    
    // Switch to custom list
    setActiveCategory('following');
  };

  const allPresets = PERSONAS;
  const allCustom = customPersonas;

  // Filters mapping based on selection
  const getFilteredList = () => {
    let list: Persona[] = [];
    if (activeCategory === 'foryou') {
      list = [...allPresets, ...allCustom];
    } else if (activeCategory === 'following') {
      list = allCustom;
    } else if (activeCategory === 'trending') {
      // Sort or filter some of the hot ones
      list = [...allPresets, ...allCustom].filter(p => 
        ['arranged-marriage', 'dads-best-friend', 'your-enemy', 'biker-boyfriend'].includes(p.id)
      );
      if (list.length === 0) list = allPresets;
    } else if (activeCategory === 'specialists') {
      list = [...allPresets, ...allCustom].filter(p => 
        ['tech-mentor', 'language-coach', 'creative-designer'].includes(p.id)
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return list;
  };

  const currentList = getFilteredList();

  const categories = [
    { id: 'foryou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'specialists', label: 'Specialists' },
    { id: 'create', label: 'Create' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121212] select-none animate-fadeIn h-full">
      {/* Top Fixed Area for Header, Search and Tabs */}
      <div className="px-5 pt-3.5 pb-1.5 flex-shrink-0 bg-[#121212]">
        {/* Top Header - Authentic character.ai Branding style */}
        <div className="flex items-center justify-between mb-3 mt-0.5">
          <div className="flex items-center gap-2 animate-fadeIn">
            <span className="font-bold text-lg tracking-wider text-white font-sans">
              Vsen.ai
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all cursor-pointer">
              <span className="text-[10px] font-sans font-bold">C</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all cursor-pointer">
              <Bell className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Search Input - Pill styled like in the mockup */}
        <div className="relative w-full mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-white placeholder:text-white/20 placeholder:font-light focus:outline-none focus:border-white/[0.2] transition-all font-sans tracking-wide shadow-inner"
          />
        </div>

        {/* Horizontal Categories Scroll Menu */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-1 rounded-full text-[9px] font-semibold tracking-tight whitespace-nowrap transition-all flex-shrink-0 active:scale-92 duration-100 ${
                  isActive
                    ? 'bg-white text-[#121212] font-bold shadow-md'
                    : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
                }`}
              >
                {cat.id === 'create' && <PlusCircle className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {activeCategory !== 'create' ? (
          currentList.length === 0 ? (
            /* Empty State for category search */
            <div className="text-center p-8 bg-white/[0.01] backdrop-blur-md rounded-[28px] border border-white/[0.06] py-14 my-4">
              <Bot className="w-10 h-10 text-white/20 mx-auto mb-3.5" />
              <h4 className="text-xs font-bold text-white">No Companions Found</h4>
              <p className="text-[11px] text-[#555555] max-w-[200px] mx-auto mt-1 leading-relaxed">
                We couldn't find any companions matching your query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('foryou');
                }}
                className="mt-4 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl text-[10px] font-bold transition-all border border-white/[0.08]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Character 2-Column Grid exactly like the screenshot */
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-5 animate-scaleIn pt-2">
              {currentList.map((persona) => {
                const isSelected = persona.id === selectedPersonaId;
                const isLiked = likedPersonaIds.includes(persona.id);
                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      onSelectPersona(persona);
                      onStartChat();
                    }}
                    className="flex flex-col cursor-pointer group transition-all duration-200 active:scale-[0.97] active:opacity-90"
                  >
                    {/* Portrait Sized Rounded Card */}
                    <div className="w-full aspect-[4/5] bg-white/[0.02] rounded-[24px] border border-white/[0.06] group-hover:border-white/[0.12] transition-all overflow-hidden relative shadow-md">
                      {/* Visual gradient backdrop */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${persona.avatarGradient} opacity-[0.65]`} />
                      
                      {/* Central artistic design element representing companion state */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:scale-110 transition-transform duration-500" />
                        <Sparkles className="w-7 h-7 text-white/30 group-hover:text-white/70 transition-colors duration-300 relative z-10" />
                      </div>

                      {/* Interactive Heart Icon Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLikePersona(persona.id);
                        }}
                        className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center active:scale-75 transition-all duration-100 z-30"
                        title={isLiked ? "Unlike" : "Like"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-white/60'}`} />
                      </button>

                      {/* Check badge overlay for selected avatar */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center text-[#121212] z-20 shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Gradient overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Character Meta details beneath the card image stack */}
                    <div className="mt-2 px-1 font-sans">
                      <div className="text-xs font-bold text-white tracking-wide leading-normal group-hover:text-white/90 transition-colors line-clamp-1 font-sans">
                        {persona.name}
                      </div>
                      <p className="text-[10.5px] text-[#888888] font-normal leading-relaxed tracking-wide mt-1 line-clamp-2 min-h-[30px] font-sans">
                        {persona.subtitle}
                      </p>
                      <div className="text-[9px] text-[#555555] font-light tracking-widest mt-1 flex items-center gap-1.5 font-sans">
                        <span>💬 {persona.chatsCount || '10k'}</span>
                        <span>•</span>
                        <span className="truncate max-w-[70px] font-light">{persona.creator || '@system'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Creator Form matching our high-quality liquid glass theme */
          <form onSubmit={handleCreatePersona} className="space-y-4 animate-scaleIn bg-white/[0.02] backdrop-blur-lg border border-white/[0.06] p-5 rounded-[28px] shadow-2xl my-2 font-sans">
            <div className="text-xs font-bold text-white tracking-wider font-sans">
              Create AI Companion Architect
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Companion Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Financial Advisor"
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-white placeholder:text-[#444] placeholder:font-light focus:outline-none focus:border-white/[0.2] transition-all font-sans font-normal tracking-wide"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Intro Subtitle / Greeting</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., He finds you at a club..."
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-white placeholder:text-[#444] placeholder:font-light focus:outline-none focus:border-white/[0.2] transition-all font-sans font-normal tracking-wide"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Aesthetic Hue Theme</label>
                <div className="flex gap-2.5 mt-1 px-1">
                  {[
                    { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
                    { id: 'purple', color: 'bg-purple-500', label: 'Purple' },
                    { id: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
                    { id: 'amber', color: 'bg-amber-500', label: 'Amber' },
                  ].map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id as any)}
                      className={`w-6 h-6 rounded-full ${theme.color} border-2 flex items-center justify-center transition-all active:scale-90 ${
                        selectedTheme === theme.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={theme.label}
                    >
                      {selectedTheme === theme.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">System Instructions</label>
                <textarea
                  required
                  rows={3}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder="e.g., You are a seasoned venture capitalist. Speak with professional brevity..."
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-white placeholder:text-[#444] placeholder:font-light focus:outline-none focus:border-white/[0.2] transition-all resize-none font-sans font-normal tracking-wide leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Brief Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Expert analysis on capital portfolios."
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-xs text-white placeholder:text-[#444] placeholder:font-light focus:outline-none focus:border-white/[0.2] transition-all font-sans font-normal tracking-wide"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-xl font-bold text-xs tracking-wider shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all active:scale-[0.95] font-sans"
            >
              Assemble AI Companion
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
