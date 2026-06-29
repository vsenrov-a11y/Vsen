export type ScreenType = 'welcome' | 'onboarding' | 'main';
export type MainTabType = 'history' | 'personas' | 'profile';

export interface Persona {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  systemInstruction: string;
  avatarGradient: string;
  accentColor: string;
  suggestedPrompts: string[];
  isCustom?: boolean;
  creator?: string;
  chatsCount?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatHistory {
  id: string;
  personaId: string;
  personaName: string;
  avatarGradient: string;
  lastMessage: string;
  timestamp: string;
  messages: ChatMessage[];
}

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  avatarGradient?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  description: string;
  avatarGradient?: string;
}

export interface StorageConfig {
  apiKey: string;
  useServerKeyFallback: boolean;
  selectedPersonaId: string;
  customPersonas: Persona[];
  chatHistories: ChatHistory[];
  likedPersonaIds?: string[];
  userPersonas?: UserPersona[];
  userProfile?: UserProfile;
}

export interface KotlinFile {
  name: string;
  path: string;
  description: string;
  code: string;
}
