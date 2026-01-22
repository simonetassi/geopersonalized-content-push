import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useGeofenceStore } from '@/store/useGeofenceStore';
import { isPointInPolygon } from '@/utils/geometry';
import { Geofence } from '@/interfaces';
import { GEOFENCE_TASK_NAME, PRECISION_TASK_NAME } from '@/utils/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { createEvent } from '@/api/Events';
import { useContentStore } from '@/store/useContentStore';

interface GeofenceTaskData {
  eventType: Location.GeofencingEventType;
  region: {
    identifier: string;
    latitude: number;
    longitude: number;
    radius: number;
    state: number;
  };
}

const startPrecisionTracking = async (geofenceId: string): Promise<void> => {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(PRECISION_TASK_NAME);
    if (isRunning) return;

    console.log(`[Precision] Starting updates for target: ${geofenceId}`);

    await Location.startLocationUpdatesAsync(PRECISION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 20,
      deferredUpdatesInterval: 2000,
    });
  } catch (e) {
    console.error('Failed to start precision tracking', e);
  }
};

const stopPrecisionTracking = async (): Promise<void> => {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(PRECISION_TASK_NAME);
    if (isRunning) {
      console.log(`[Precision] Stopping updates.`);
      await Location.stopLocationUpdatesAsync(PRECISION_TASK_NAME);
    }
  } catch (e) {
    console.error('Failed to stop precision tracking', e);
  }
};

const sendEventToBackend = async (
  type: 'entry' | 'exit',
  geofence: Geofence,
  latitude: number,
  longitude: number,
): Promise<void> => {
  try {
    let user = useAuthStore.getState().user;
    if (!user) {
      await useAuthStore.persist.rehydrate();
      user = useAuthStore.getState().user;
    }

    if (!user) return;

    console.log(`[Geofence] Sending ${type} event to backend...`);
    await createEvent({
      type,
      userId: user.id,
      fenceId: geofence.id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      timestamp: new Date().toISOString(),
    });
    console.log(`[Geofence] Backend synced successfully.`);
  } catch (error) {
    console.error(`[Geofence] Backend Sync Failed:`, error);
  }
};

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowList: true,
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  if (data) {
    const { eventType, region } = data as GeofenceTaskData;
    const regionId = region.identifier;

    // ENTER BUFFER ZONE
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`[Geofence] Entered Circle: ${regionId}`);

      try {
        let geofences = useGeofenceStore.getState().geofences;
        if (geofences.length === 0) {
          await useGeofenceStore.persist.rehydrate();
          geofences = useGeofenceStore.getState().geofences;
        }

        const targetGeofence = geofences.find(g => g.id === regionId);
        if (!targetGeofence) return;

        useGeofenceStore.getState().setActiveGeofenceId(regionId);
        useGeofenceStore.getState().setInsidePolygon(false);

        console.log('[Geofence] Starting Precision Tracker.');
        await startPrecisionTracking(targetGeofence.id);

        void useContentStore.getState().prefetchByGeofence(targetGeofence);
      } catch (err) {
        console.error('[Geofence] Error:', err);
      }
    }

    // EXIT BUFFER ZONE
    if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`[Geofence] OS Triggered EXIT (Circle): ${regionId}`);
      try {
        const state = useGeofenceStore.getState();

        if (state.isInsidePolygon) {
          console.log('[Geofence] Forced Polygon Exit (Native Trigger)');
          await sendEventToBackend(
            'exit',
            { id: regionId } as Geofence,
            region.latitude,
            region.longitude,
          );
        }

        state.setActiveGeofenceId(null);
        state.setInsidePolygon(false);
        await stopPrecisionTracking();
      } catch (err) {
        console.error('[Geofence] Exit Task Error:', err);
      }
    }
  }
});

TaskManager.defineTask(PRECISION_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (!location) return;

    const state = useGeofenceStore.getState();
    const activeId = state.activeGeofenceId;
    const wasInside = state.isInsidePolygon;

    if (!activeId) {
      await stopPrecisionTracking();
      return;
    }

    const targetGeofence = state.geofences.find(g => g.id === activeId);

    if (targetGeofence) {
      const { latitude, longitude } = location.coords;
      const isNowInside = isPointInPolygon(latitude, longitude, targetGeofence);

      // ENTER POLYGON
      if (isNowInside && !wasInside) {
        console.log(`[Precision] ENTERED POLYGON: ${targetGeofence.name}`);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'You entered the zone!',
            body: `Discover content for: ${targetGeofence.name}`,
            data: { geofenceId: targetGeofence.id },
          },
          trigger: null,
        });

        await sendEventToBackend('entry', targetGeofence, latitude, longitude);
        state.setInsidePolygon(true);
      }

      // EXIT POLYGON
      else if (!isNowInside && wasInside) {
        console.log(`[Precision] EXITED POLYGON: ${targetGeofence.name}`);

        await sendEventToBackend('exit', targetGeofence, latitude, longitude);
        state.setInsidePolygon(false);
      }
    }
  }
});
