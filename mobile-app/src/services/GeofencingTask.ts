import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useGeofenceStore } from '@/store/useGeofenceStore';
import { isPointInPolygon } from '@/utils/geometry';
import { Geofence } from '@/interfaces';
import { GEOFENCE_TASK_NAME } from '@/utils/constants';

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
  if (error) {
    console.error('Geofence Task Error:', error);
    return;
  }

  if (data) {
    const { eventType, region } = data as GeofenceTaskData;
    const regionId = region.identifier;

    // ENTER EVENT
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`[Geofence] OS Triggered ENTER: ${regionId}`);

      try {
        let geofences = useGeofenceStore.getState().geofences;

        if (geofences.length === 0) {
          await useGeofenceStore.persist.rehydrate();
          geofences = useGeofenceStore.getState().geofences;
        }

        const targetGeofence: Geofence | undefined = geofences.find(g => g.id === regionId);

        if (!targetGeofence) {
          console.warn(`[Geofence] ❌ ID ${regionId} not found in store!`);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        const { latitude, longitude } = location.coords;
        console.log(`[Geofence] User Position: ${latitude}, ${longitude}`);

        const isInside = isPointInPolygon(latitude, longitude, targetGeofence);

        if (isInside) {
          console.log('[Geofence] CONFIRMED INSIDE POLYGON. Sending Notification.');

          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'You entered the zone!',
              body: `Discover content for: ${targetGeofence.name}`,
              data: { geofenceId: regionId },
            },
            trigger: null,
          });
        } else {
          console.log('[Geofence] FALSE ALARM. Inside Circle but Outside Polygon.');
        }
      } catch (err: unknown) {
        console.error('[Geofence] CRASH inside Task:', err);
      }
    }

    // EXIT EVENT
    if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`[Geofence] OS Triggered EXIT: ${regionId}`);
      return;
    }
  }
});
