import { StorageConfig } from '../types';

const STORAGE_KEY = 'vsen_encrypted_shared_prefs';

export const getStorageConfig = (): StorageConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        apiKey: parsed.apiKey || '',
        useServerKeyFallback: parsed.useServerKeyFallback !== false,
        selectedPersonaId: parsed.selectedPersonaId || 'tech-mentor',
        customPersonas: parsed.customPersonas || [],
        chatHistories: parsed.chatHistories || [],
        likedPersonaIds: parsed.likedPersonaIds || [],
        userPersonas: parsed.userPersonas || [],
        userProfile: parsed.userProfile || {
          name: 'vsenrov',
          username: 'vsenrov',
          description: 'AI Companion enthusiast.',
          avatarGradient: 'from-purple-600 to-indigo-600',
        },
      };
    }
  } catch (e) {
    console.error('Failed to load storage', e);
  }
  return {
    apiKey: '',
    useServerKeyFallback: true,
    selectedPersonaId: 'tech-mentor',
    customPersonas: [],
    chatHistories: [],
    likedPersonaIds: [],
    userPersonas: [],
    userProfile: {
      name: 'vsenrov',
      username: 'vsenrov',
      description: 'AI Companion enthusiast.',
      avatarGradient: 'from-purple-600 to-indigo-600',
    },
  };
};

export const saveStorageConfig = (config: Partial<StorageConfig>): StorageConfig => {
  const current = getStorageConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save storage', e);
  }
  return updated;
};
