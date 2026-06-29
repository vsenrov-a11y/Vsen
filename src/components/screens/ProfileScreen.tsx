import React, { useState } from 'react';
import { StorageConfig, Persona, UserPersona, UserProfile } from '../../types';
import { PERSONAS } from '../../data/personas';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  Cpu, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Flame, 
  Sparkles, 
  Heart, 
  FileText, 
  Settings, 
  Share2, 
  Pencil, 
  Plus, 
  Trash2, 
  X, 
  PlusCircle, 
  Bot,
  MessageSquare,
  Sparkle
} from 'lucide-react';

interface ProfileScreenProps {
  storageConfig: StorageConfig;
  onUpdateConfig: (config: Partial<StorageConfig>) => void;
  onResetApp: () => void;
  onOpenCodeViewer: () => void;
  onNavigateTab?: (tab: 'history' | 'personas' | 'profile') => void;
}

type ProfileTabType = 'characters' | 'personas' | 'liked';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  storageConfig,
  onUpdateConfig,
  onResetApp,
  onOpenCodeViewer,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileTabType>('characters');
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Modals for creating entities
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Edit Profile form state
  const profile = storageConfig.userProfile || {
    name: 'vsenrov',
    username: 'vsenrov',
    description: 'AI Companion enthusiast.',
    avatarGradient: 'from-purple-600 to-indigo-600',
  };
  const [editName, setEditName] = useState(profile.name);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editDesc, setEditDesc] = useState(profile.description);

  // Key vault state
  const [apiKey, setApiKey] = useState(storageConfig.apiKey);
  const [isSaved, setIsSaved] = useState(false);

  // Create Persona form state
  const [personaName, setPersonaName] = useState('');
  const [personaDesc, setPersonaDesc] = useState('');

  // Create Character form state
  const [charName, setCharName] = useState('');
  const [charSubtitle, setCharSubtitle] = useState('');
  const [charSystem, setCharSystem] = useState('');
  const [charDesc, setCharDesc] = useState('');
  const [charTheme, setCharTheme] = useState<'blue' | 'purple' | 'emerald' | 'amber'>('purple');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      userProfile: {
        ...profile,
        name: editName.trim() || 'vsenrov',
        username: editUsername.trim() || 'vsenrov',
        description: editDesc.trim(),
      }
    });
    setShowEditProfile(false);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ apiKey: apiKey.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddUserPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaName.trim() || !personaDesc.trim()) return;

    const gradients = [
      'from-blue-500/20 to-indigo-500/30 border-blue-400/30 text-blue-300',
      'from-emerald-500/20 to-teal-500/30 border-emerald-400/30 text-emerald-300',
      'from-purple-500/20 to-pink-500/30 border-purple-400/30 text-purple-300',
      'from-amber-500/20 to-orange-500/30 border-amber-400/30 text-amber-300',
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newPersona: UserPersona = {
      id: `user-persona-${Date.now()}`,
      name: personaName.trim(),
      description: personaDesc.trim(),
      avatarGradient: randomGradient,
    };

    const currentPersonas = storageConfig.userPersonas || [];
    onUpdateConfig({
      userPersonas: [...currentPersonas, newPersona]
    });

    // Reset fields
    setPersonaName('');
    setPersonaDesc('');
    setShowCreatePersona(false);
  };

  const handleDeleteUserPersona = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentPersonas = storageConfig.userPersonas || [];
    onUpdateConfig({
      userPersonas: currentPersonas.filter(p => p.id !== id)
    });
  };

  const handleAddCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim() || !charSystem.trim()) return;

    let avatarGradient = 'from-purple-500/20 to-pink-500/30 border-purple-400/30 text-purple-300';
    let accentColor = '#D946EF';

    if (charTheme === 'blue') {
      avatarGradient = 'from-blue-500/20 to-cyan-500/30 border-blue-400/30 text-blue-300';
      accentColor = '#3B82F6';
    } else if (charTheme === 'emerald') {
      avatarGradient = 'from-emerald-500/20 to-teal-500/30 border-emerald-400/30 text-emerald-300';
      accentColor = '#10B981';
    } else if (charTheme === 'amber') {
      avatarGradient = 'from-amber-500/20 to-orange-500/30 border-amber-400/30 text-amber-300';
      accentColor = '#F59E0B';
    }

    const newChar: Persona = {
      id: `custom-${Date.now()}`,
      name: charName.trim(),
      subtitle: charSubtitle.trim() || 'Custom Companion',
      description: charDesc.trim() || 'Custom instruction companion.',
      systemInstruction: charSystem.trim(),
      avatarGradient,
      accentColor,
      creator: `@${profile.username}`,
      chatsCount: '0',
      suggestedPrompts: [
        `Introduce yourself, ${charName.trim()}.`,
        `How can you help me today?`
      ],
      isCustom: true,
    };

    const currentCustom = storageConfig.customPersonas || [];
    onUpdateConfig({
      customPersonas: [...currentCustom, newChar]
    });

    // Reset fields
    setCharName('');
    setCharSubtitle('');
    setCharSystem('');
    setCharDesc('');
    setShowCreateCharacter(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`https://vsen.ai/u/${profile.username}`);
    setShowShareToast(true);
    setTimeout(() => {
      setShowShareToast(false);
    }, 2000);
  };

  const handleDeleteCustomCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentCustom = storageConfig.customPersonas || [];
    onUpdateConfig({
      customPersonas: currentCustom.filter(p => p.id !== id)
    });
  };

  // Lists
  const customCharacters = storageConfig.customPersonas || [];
  const userPersonas = storageConfig.userPersonas || [];
  
  const allCompanions = [...PERSONAS, ...customCharacters];
  const likedCharacters = allCompanions.filter(p => 
    (storageConfig.likedPersonaIds || []).includes(p.id)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#121212] select-none h-full relative">
      
      {/* Premium Toast Feedback */}
      {showShareToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-3.5 py-2 bg-white text-black font-sans font-bold text-[10px] rounded-2xl shadow-xl border border-white/20 flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Profile link copied to clipboard</span>
        </div>
      )}
      
      {/* Settings Panel Overlay Drawer */}
      {showSettings && (
        <div className="absolute inset-0 bg-[#121212] z-50 flex flex-col p-5 animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Engine Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pb-10">
            {/* Secure API Key Vault Card */}
            <div className="bg-white/[0.02] backdrop-blur-lg rounded-[28px] p-5 border border-white/[0.06] shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-[#888888]" />
                <span className="text-xs font-bold text-white tracking-tight">AI Key Vault</span>
              </div>
              <form onSubmit={handleSaveKey} className="space-y-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use server API key)"
                  className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-[#444] focus:outline-none focus:border-white/[0.2] font-sans"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-white/[0.04] text-white border border-white/[0.08] font-bold text-xs tracking-tight active:scale-[0.95] flex items-center justify-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Vault Securely Updated</span>
                    </>
                  ) : (
                    <span>Update API Key</span>
                  )}
                </button>
              </form>
            </div>

            {/* Specs Metadata card */}
            <div className="bg-white/[0.02] backdrop-blur-lg rounded-[28px] p-5 border border-white/[0.06] space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#888888]" />
                <span className="text-xs font-bold text-white tracking-tight">Engine Specification</span>
              </div>
              <div className="space-y-2 text-[10.5px] font-sans font-light tracking-wide text-[#777]">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Security Store</span>
                  <span className="text-emerald-400 font-semibold">EncryptedSharedPrefs</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Transport Protocol</span>
                  <span className="text-white">HTTP Retrofit Client</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Layout Engine</span>
                  <span className="text-white">Jetpack Compose UI v1.8</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Concurrency</span>
                  <span className="text-white">Kotlin Flow Streams</span>
                </div>
              </div>
            </div>

            {/* View Code Action Button */}
            <button
              onClick={() => {
                setShowSettings(false);
                onOpenCodeViewer();
              }}
              className="w-full p-4 rounded-[24px] bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs text-white active:scale-[0.96]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#E0E0E0]" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs">Kotlin Codebase</div>
                  <div className="text-[10px] text-[#666]">Show classes and layout specifications</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#444]" />
            </button>

            {/* Reset Database option */}
            <button
              onClick={() => {
                if (confirm("Reset Vsen.Ai? This will wipe all chat logs, custom personas, and settings permanently.")) {
                  onResetApp();
                }
              }}
              className="w-full p-4 rounded-[24px] bg-red-500/[0.03] hover:bg-red-500/[0.08] border border-red-500/10 hover:border-red-500/20 text-red-400 flex items-center justify-center gap-2 transition-all active:scale-[0.96]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Reset Application Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Panel Overlay Drawer */}
      {showEditProfile && (
        <div className="absolute inset-0 bg-[#121212] z-50 flex flex-col p-5 animate-slideIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Edit Profile</h3>
            <button 
              onClick={() => setShowEditProfile(false)}
              className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Profile Pic Silhouette */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white relative">
                  <User className="w-10 h-10 text-white/40" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-[#121212] flex items-center justify-center text-black">
                    <Pencil className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[10px] text-[#666] font-sans mt-2">Change Avatar</span>
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans font-normal tracking-wide"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-sans">@</span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans font-normal tracking-wide"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1.5 px-1">Short Biography</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="I love chatting with AI characters!"
                  className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-[#444] placeholder:font-light focus:outline-none resize-none font-sans font-normal tracking-wide leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white text-black font-bold text-xs tracking-tight shadow-xl transition-all active:scale-[0.95] mb-4 font-sans"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Create Persona Modal Overlay */}
      {showCreatePersona && (
        <div className="absolute inset-0 bg-[#121212]/95 backdrop-blur-md z-50 flex flex-col justify-center p-6 animate-fadeIn">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl relative space-y-4 font-sans">
            <button 
              onClick={() => setShowCreatePersona(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center pb-1">
              <FileText className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white tracking-tight">Create User Persona</h3>
              <p className="text-[10px] text-white/40 mt-1">Characters will tailor responses to this persona</p>
            </div>

            <form onSubmit={handleAddUserPersona} className="space-y-4">
              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Persona Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gamer, Student, Lawyer"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Describe Yourself (Who are you?)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your traits, background, or current focus. e.g. 'I am a computer science student who likes video games and fast-paced chats.'"
                  value={personaDesc}
                  onChange={(e) => setPersonaDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-white/20 focus:outline-none resize-none font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-xs tracking-tight shadow-md active:scale-95 transition-all font-sans"
              >
                Create Persona
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Character Modal Overlay */}
      {showCreateCharacter && (
        <div className="absolute inset-0 bg-[#121212]/95 backdrop-blur-md z-50 flex flex-col justify-center p-6 animate-fadeIn overflow-y-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl relative space-y-4 my-auto">
            <button 
              onClick={() => setShowCreateCharacter(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-1">
              <Bot className="w-8 h-8 text-[#00D27A] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white tracking-tight">Construct AI Character</h3>
              <p className="text-[10px] text-white/40 mt-1">Design an entirely new conversational agent</p>
            </div>

            <form onSubmit={handleAddCustomCharacter} className="space-y-3 font-sans">
              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Character Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarcastic Critic"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Intro/Greeting Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. He smirks, reviewing your file..."
                  value={charSubtitle}
                  onChange={(e) => setCharSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Aesthetic Theme</label>
                <div className="flex gap-2 py-0.5">
                  {[
                    { id: 'blue', color: 'bg-blue-500' },
                    { id: 'purple', color: 'bg-purple-500' },
                    { id: 'emerald', color: 'bg-emerald-500' },
                    { id: 'amber', color: 'bg-amber-500' },
                  ].map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setCharTheme(theme.id as any)}
                      className={`w-5 h-5 rounded-full ${theme.color} border-2 flex items-center justify-center transition-all ${
                        charTheme === theme.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'
                      }`}
                    >
                      {charTheme === theme.id && <div className="w-1 h-1 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">System instructions (Rules)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="How should this character act? e.g. Speak with biting sarcasm and dry humor..."
                  value={charSystem}
                  onChange={(e) => setCharSystem(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none resize-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[9px] font-sans font-light uppercase tracking-widest text-[#888] block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. A harsh but funny book reviewer."
                  value={charDesc}
                  onChange={(e) => setCharDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-xs tracking-tight shadow-md active:scale-95 transition-all mt-1 font-sans"
              >
                Assemble Character
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Top Profile Content Area (Non-Scrollable Top Profile Header) */}
      <div className="p-4 pb-2.5 flex-shrink-0 bg-[#121212] border-b border-white/[0.03]">
        {/* Top Mini Header */}
        <div className="flex items-center justify-between mb-3 mt-0.5">
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-white/50">Profile</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenCodeViewer}
              className="w-7 h-7 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/70 hover:text-white"
              title="View Source Code"
            >
              <span className="text-[10px] font-sans font-bold">C</span>
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-7 h-7 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/70 hover:text-white active:rotate-45 transition-transform"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Card Center View - Highly Pulled Up & Compact */}
        <div className="flex flex-col items-center text-center">
          {/* Squircular avatar with clean dark border */}
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-white/[0.08] flex items-center justify-center shadow-lg relative active:scale-95 transition-transform duration-200">
            <span className="text-white font-bold text-xl font-sans">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-sm font-bold text-white mt-2 tracking-wide font-sans">{profile.name}</h2>
          <p className="text-[10px] text-white/40 mt-0.5 font-sans font-light tracking-wide">@{profile.username}</p>
          <p className="text-[10px] text-white/60 mt-1 max-w-[240px] leading-relaxed line-clamp-1 font-sans font-normal tracking-wide">
            {profile.description || "No biography provided yet."}
          </p>

          {/* Button actions bar - Compact */}
          <div className="flex items-center gap-2 mt-2.5 w-full max-w-[280px]">
            <button
              onClick={() => {
                setEditName(profile.name);
                setEditUsername(profile.username);
                setEditDesc(profile.description);
                setShowEditProfile(true);
              }}
              className="flex-1 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-[10px] font-bold border border-white/[0.08] active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Pencil className="w-2.5 h-2.5 text-white/60" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleShareProfile}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-[10px] font-bold border border-white/[0.08] active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Share2 className="w-2.5 h-2.5 text-white/60" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Overhauled Sub-tabs selector - Squircular white sliding active container, no counts */}
        <div className="flex gap-1 mt-2 p-0.5 bg-white/[0.02] border border-white/[0.05] rounded-lg">
          {[
            { id: 'characters', label: 'Characters', icon: User },
            { id: 'personas', label: 'Personas', icon: FileText },
            { id: 'liked', label: 'Liked', icon: Heart },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as ProfileTabType)}
                className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 transition-all duration-300 relative font-sans active:scale-95 ${
                  isActive 
                    ? 'bg-white text-black font-bold shadow-[0_2px_6px_rgba(255,255,255,0.08)]' 
                    : 'bg-transparent text-white/50 hover:text-white/80 font-medium'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'stroke-[2.5]' : ''} ${isActive && tab.id === 'liked' ? 'fill-current' : ''}`} />
                <span className="text-[9.5px] tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bottom List Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3 bg-[#121212]/30">
        
        {/* Tab 1: Characters the user made */}
        {activeSubTab === 'characters' && (
          <div className="space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">My Assemblies</span>
              {customCharacters.length > 0 && (
                <button
                  onClick={() => setShowCreateCharacter(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white/80 border border-white/[0.08] hover:border-white/[0.15] text-[10px] font-bold tracking-wide transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <Plus className="w-3 h-3 text-white/60" />
                  <span>Create</span>
                </button>
              )}
            </div>

            {customCharacters.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-[28px] p-6 shadow-inner animate-fadeIn">
                <Bot className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white font-sans">No Characters Constructed</h4>
                <p className="text-[11px] text-white/45 max-w-[200px] mx-auto mt-2 leading-relaxed font-sans font-light">
                  Design custom conversational agents with custom system prompts and rules.
                </p>
                <button
                  onClick={() => setShowCreateCharacter(true)}
                  className="mt-5 px-5 py-2.5 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-all active:scale-95 duration-150 font-sans"
                >
                  Create Character
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {customCharacters.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => {
                      onUpdateConfig({ selectedPersonaId: persona.id });
                      if (onNavigateTab) onNavigateTab('personas');
                    }}
                    className="flex flex-col text-left cursor-pointer group active:scale-95 transition-all"
                  >
                    <div className="w-full aspect-[4/5] bg-white/[0.02] rounded-2xl border border-white/[0.06] group-hover:border-white/[0.12] overflow-hidden relative shadow-md transition-all duration-200">
                      {/* Visual gradient backdrop */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${persona.avatarGradient} opacity-[0.65]`} />
                      
                      {/* Central artistic design element representing companion state */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 blur-lg group-hover:scale-110 transition-transform duration-500" />
                        <Sparkles className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors duration-200" />
                      </div>

                      {/* Delete button overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomCharacter(persona.id, e);
                        }}
                        className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-90 transition-all z-20 shadow-sm"
                        title="Delete Character"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-1.5 px-0.5 font-sans">
                      <span className="text-xs font-bold text-white truncate block">{persona.name}</span>
                      <p className="text-[10px] text-white/40 truncate">{persona.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Personas the user made */}
        {activeSubTab === 'personas' && (
          <div className="space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">My Personas</span>
              {userPersonas.length > 0 && (
                <button
                  onClick={() => setShowCreatePersona(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white/80 border border-white/[0.08] hover:border-white/[0.15] text-[10px] font-bold tracking-wide transition-all duration-150 active:scale-95 shadow-sm"
                >
                  <Plus className="w-3 h-3 text-white/60" />
                  <span>Create</span>
                </button>
              )}
            </div>

            {userPersonas.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-[28px] p-6 shadow-inner animate-fadeIn">
                <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white font-sans">No Personas Defined</h4>
                <p className="text-[11px] text-white/45 max-w-[220px] mx-auto mt-2 leading-relaxed font-sans font-light">
                  Personas describe you so AI characters understand your personality and background.
                </p>
                <button
                  onClick={() => setShowCreatePersona(true)}
                  className="mt-5 px-5 py-2.5 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-all active:scale-95 duration-150 font-sans"
                >
                  Create Persona
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userPersonas.map((uPersona) => (
                  <div
                    key={uPersona.id}
                    className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-start gap-3.5 group relative"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                      {uPersona.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-left font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{uPersona.name}</span>
                        <button
                          onClick={(e) => handleDeleteUserPersona(uPersona.id, e)}
                          className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Persona"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10.5px] text-[#888] font-normal leading-relaxed mt-1 font-sans">
                        {uPersona.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Characters Users Liked */}
        {activeSubTab === 'liked' && (
          <div className="space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-sans font-bold text-white/40 uppercase tracking-wider">Favorited Companions</span>
            </div>

            {likedCharacters.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-[28px] p-6 shadow-inner animate-fadeIn">
                <Heart className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white font-sans">No Liked Characters</h4>
                <p className="text-[11px] text-white/45 max-w-[220px] mx-auto mt-2 leading-relaxed font-sans font-light">
                  Heart characters from the main tab, and they will show up here as favorites.
                </p>
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('personas');
                  }}
                  className="mt-5 px-5 py-2.5 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-all active:scale-95 duration-150 font-sans"
                >
                  Explore Characters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {likedCharacters.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => {
                      onUpdateConfig({ selectedPersonaId: persona.id });
                      if (onNavigateTab) onNavigateTab('personas');
                    }}
                    className="flex flex-col text-left cursor-pointer group active:scale-95 transition-all"
                  >
                    <div className="w-full aspect-[4/5] bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden relative shadow-md">
                      <div className={`absolute inset-0 bg-gradient-to-br ${persona.avatarGradient} opacity-[0.65]`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white/30" />
                      </div>
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="mt-1.5 px-0.5 font-sans">
                      <span className="text-xs font-bold text-white truncate block">{persona.name}</span>
                      <p className="text-[10px] text-white/40 truncate">{persona.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
