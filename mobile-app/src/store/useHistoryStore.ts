import { getEvents } from '@/api/Events';
import { Event } from '@/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface HistoryState {
  history: Event[];
  isLoading: boolean;
  error: string | null;

  fetchHistory: (userId: string) => Promise<void>;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    set => ({
      history: [],
      isLoading: false,
      error: null,

      fetchHistory: async (userId: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const data = await getEvents(userId);

          set({ history: data, isLoading: false });
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Failed to fetch history';
          set({ error: msg, isLoading: false });
        }
      },

      clearHistory: (): void => {
        set({ history: [], error: null });
      },
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
