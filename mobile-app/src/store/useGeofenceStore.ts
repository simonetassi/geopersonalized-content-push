import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Geofence } from '@/interfaces';
import { getGeofences } from '@/api/Geofences';
import { LocationRegion, startGeofencingAsync, stopGeofencingAsync } from 'expo-location';
import { CircularRegion, convertPolygonToCircle } from '@/utils/geometry';
import { Polygon } from 'geojson';
import { GEOFENCE_TASK_NAME } from '@/utils/constants';
import * as TaskManager from 'expo-task-manager';

interface GeofenceState {
  geofences: Geofence[];
  lastSync: string | null;
  isLoading: boolean;
  error: string | null;
  isMonitoring: boolean;

  syncGeofences: () => Promise<void>;
  clearGeofences: () => void;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
}

export const useGeofenceStore = create<GeofenceState>()(
  persist(
    (set, get) => ({
      geofences: [],
      lastSync: null,
      isLoading: false,
      error: null,
      isMonitoring: false,

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

      clearGeofences: (): void => {
        set({ geofences: [], lastSync: null, error: null });
      },

      startMonitoring: async (): Promise<void> => {
        const { geofences } = get();

        if (geofences.length === 0) {
          console.warn('No geofences to monitor');
          return;
        }

        const regions: LocationRegion[] = geofences
          .filter((g: Geofence) => {
            const geo = g.geometry;
            return geo && geo.type === 'Polygon';
          })
          .map((g: Geofence) => convertPolygonToCircle(g.id, g.geometry as Polygon))
          .filter((r: CircularRegion | null): r is CircularRegion => r !== null);

        // ios - max 20 regions, android - max 100 regions
        if (regions.length > 20) {
          console.warn('Limiting monitoring to first 20 regions due to OS limits.');
          regions.length = 20;
        }

        try {
          await startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
          console.log(`[Geofence] Monitoring started for ${regions.length} regions.`);
          set({ isMonitoring: true });
        } catch (error: unknown) {
          console.error('Failed to start monitoring:', error);
        }
      },

      stopMonitoring: async (): Promise<void> => {
        try {
          const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);

          if (isRegistered) {
            await stopGeofencingAsync(GEOFENCE_TASK_NAME);
            console.log('[Geofence] Monitoring stopped successfully.');
          } else {
            console.log('[Geofence] Stop skipped: Task was not running.');
          }

          set({ isMonitoring: false });
        } catch (error: unknown) {
          console.log('Handled stop error:', error);
          set({ isMonitoring: false });
        }
      },
    }),
    {
      name: 'geofence-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
