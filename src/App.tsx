import React, { useState, useEffect } from 'react';
import { ScreenType, MainTabType, StorageConfig, Persona, ChatMessage, ChatHistory } from './types';
import { getStorageConfig, saveStorageConfig } from './utils/storage';
import { PERSONAS } from './data/personas';
import { PhoneFrame } from './components/PhoneFrame';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { PersonaHubScreen } from './components/screens/PersonaHubScreen';
import { ChatHistoryScreen } from './components/screens/ChatHistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { PremiumChatScreen } from './components/screens/PremiumChatScreen';
import { GlassDock } from './components/GlassDock';
import { KotlinSourceViewer } from './components/KotlinSourceViewer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [activeTab, setActiveTab] = useState<MainTabType>('personas');
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({
    apiKey: '',
    useServerKeyFallback: true,
    selectedPersonaId: 'tech-mentor',
    customPersonas: [],
    chatHistories: [],
  });
  
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);

  // Initialize storage config on mount
  useEffect(() => {
    const config = getStorageConfig();
    setStorageConfig(config);
  }, []);

  const handleUpdateConfig = (updates: Partial<StorageConfig>) => {
    const updated = saveStorageConfig(updates);
    setStorageConfig(updated);
  };

  const handleSelectPersona = (persona: Persona) => {
    handleUpdateConfig({ selectedPersonaId: persona.id });
  };

  const handleCreateCustomPersona = (newPersona: Persona) => {
    setStorageConfig((prev) => {
      const updatedCustom = [...prev.customPersonas, newPersona];
      const updated = saveStorageConfig({
        customPersonas: updatedCustom,
        selectedPersonaId: newPersona.id,
      });
      return updated;
    });
  };

  const handleOnboardingContinue = () => {
    const updated = getStorageConfig();
    setStorageConfig(updated);
    setCurrentScreen('main');
    setActiveTab('personas');
  };

  const handleSaveHistory = (historyId: string, messages: ChatMessage[], lastMessageText: string) => {
    setStorageConfig((prev) => {
      const existingIdx = prev.chatHistories.findIndex((h) => h.id === historyId);
      let updatedHistories = [...prev.chatHistories];

      const p = [...PERSONAS, ...prev.customPersonas].find((p) => p.id === prev.selectedPersonaId) || PERSONAS[0];

      if (existingIdx >= 0) {
        // Update existing session
        updatedHistories[existingIdx] = {
          ...updatedHistories[existingIdx],
          messages,
          lastMessage: lastMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
      } else {
        // Prepend brand new session
        updatedHistories.unshift({
          id: historyId,
          personaId: p.id,
          personaName: p.name,
          avatarGradient: p.avatarGradient,
          lastMessage: lastMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          messages,
        });
      }

      const updated = saveStorageConfig({ chatHistories: updatedHistories });
      return updated;
    });
  };

  const handleDeleteChat = (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open
    setStorageConfig((prev) => {
      const updatedHistories = prev.chatHistories.filter((h) => h.id !== historyId);
      const updated = saveStorageConfig({ chatHistories: updatedHistories });
      return updated;
    });
    if (activeChatSessionId === historyId) {
      setActiveChatSessionId(null);
    }
  };

  const handleSelectChat = (historyId: string) => {
    const session = storageConfig.chatHistories.find(h => h.id === historyId);
    if (session) {
      handleUpdateConfig({ selectedPersonaId: session.personaId });
      setActiveChatSessionId(historyId);
    }
  };

  const handleToggleLikePersona = (personaId: string) => {
    setStorageConfig((prev) => {
      const liked = prev.likedPersonaIds || [];
      const isLiked = liked.includes(personaId);
      const updatedLiked = isLiked
        ? liked.filter((id) => id !== personaId)
        : [...liked, personaId];
      const updated = saveStorageConfig({ likedPersonaIds: updatedLiked });
      return updated;
    });
  };

  const handleResetApp = () => {
    localStorage.clear();
    setStorageConfig({
      apiKey: '',
      useServerKeyFallback: true,
      selectedPersonaId: 'tech-mentor',
      customPersonas: [],
      chatHistories: [],
    });
    setCurrentScreen('welcome');
    setActiveTab('personas');
    setActiveChatSessionId(null);
  };

  // Find currently active persona/companion
  const allCompanions = [...PERSONAS, ...storageConfig.customPersonas];
  const selectedPersona = allCompanions.find(p => p.id === storageConfig.selectedPersonaId) || allCompanions[0];

  // Active chat details if a history session is loaded
  const activeChatSession = storageConfig.chatHistories.find(h => h.id === activeChatSessionId);

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A]">
      <PhoneFrame
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          if (screen === 'main') {
            setActiveChatSessionId(null);
          }
        }}
        onOpenCodeViewer={() => setIsCodeViewerOpen(true)}
      >
        {currentScreen === 'welcome' && (
          <WelcomeScreen onSetUp={() => setCurrentScreen('onboarding')} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            storageConfig={storageConfig}
            onContinue={handleOnboardingContinue}
          />
        )}

        {currentScreen === 'main' && (
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {activeChatSessionId ? (
              /* Active Chat Session Overlay */
              <PremiumChatScreen
                persona={selectedPersona}
                apiKey={storageConfig.apiKey}
                historyId={activeChatSessionId}
                initialMessages={activeChatSession?.messages}
                onBack={() => setActiveChatSessionId(null)}
                onSaveHistory={handleSaveHistory}
              />
            ) : (
              /* Screen Tab Switcher */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {activeTab === 'history' && (
                  <ChatHistoryScreen
                    chatHistories={storageConfig.chatHistories}
                    personas={allCompanions}
                    onSelectChat={handleSelectChat}
                    onDeleteChat={handleDeleteChat}
                    onNavigateToPersonas={() => setActiveTab('personas')}
                  />
                )}

                {activeTab === 'personas' && (
                  <PersonaHubScreen
                    selectedPersonaId={storageConfig.selectedPersonaId}
                    customPersonas={storageConfig.customPersonas}
                    likedPersonaIds={storageConfig.likedPersonaIds || []}
                    onSelectPersona={handleSelectPersona}
                    onStartChat={() => {
                      // Start a new chat session
                      setActiveChatSessionId(null); // Will trigger new session generation on first message
                      setActiveChatSessionId(`chat-${Date.now()}`);
                    }}
                    onCreateCustomPersona={handleCreateCustomPersona}
                    onToggleLikePersona={handleToggleLikePersona}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileScreen
                    storageConfig={storageConfig}
                    onUpdateConfig={handleUpdateConfig}
                    onResetApp={handleResetApp}
                    onOpenCodeViewer={() => setIsCodeViewerOpen(true)}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {/* Highly Polished Glass Dock Bottom Bar */}
                <GlassDock
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setActiveChatSessionId(null); // Close active chat when switching main views
                  }}
                />
              </div>
            )}
          </div>
        )}
      </PhoneFrame>

      {/* Interactive Kotlin & Jetpack Compose Source Code Viewer overlay */}
      <KotlinSourceViewer
        isOpen={isCodeViewerOpen}
        onClose={() => setIsCodeViewerOpen(false)}
      />
    </div>
  );
}
