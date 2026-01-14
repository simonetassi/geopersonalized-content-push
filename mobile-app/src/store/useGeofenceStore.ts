import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Geofence } from '@/interfaces';
import { getGeofences } from '@/api/Geofences';

interface GeofenceState {
  geofences: Geofence[];
  lastSync: string | null;
  isLoading: boolean;
  error: string | null;

  syncGeofences: () => Promise<void>;
}

export const useGeofenceStore = create<GeofenceState>()(
  persist(
    set => ({
      geofences: [],
      lastSync: null,
      isLoading: false,
      error: null,

      syncGeofences: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const data = await getGeofences();
          set({
            geofences: data,
            lastSync: new Date().toISOString(),
            isLoading: false,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to sync geofences';
          set({ error: msg, isLoading: false });
        }
      },
    }),
    {
      name: 'geofence-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
