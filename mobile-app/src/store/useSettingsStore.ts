import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isPrivacyEnabled: boolean;
  togglePrivacy: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isPrivacyEnabled: false,
      togglePrivacy: () => set(state => ({ isPrivacyEnabled: !state.isPrivacyEnabled })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
