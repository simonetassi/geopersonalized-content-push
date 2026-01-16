import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';

interface UsePermissionsReturn {
  isGranted: boolean;
  check: () => Promise<void>;
  request: () => Promise<boolean>;
  status: Location.PermissionStatus;
  backgroundStatus: Location.PermissionStatus;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [status, setStatus] = useState<Location.PermissionStatus>(
    Location.PermissionStatus.UNDETERMINED,
  );
  const [backgroundStatus, setBackgroundStatus] = useState<Location.PermissionStatus>(
    Location.PermissionStatus.UNDETERMINED,
  );

  const check = async (): Promise<void> => {
    const { status: fg } = await Location.getForegroundPermissionsAsync();
    const { status: bg } = await Location.getBackgroundPermissionsAsync();
    setStatus(fg);
    setBackgroundStatus(bg);
  };

  useEffect(() => {
    void check();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        void check();
      }
    });

    return (): void => subscription.remove();
  }, []);

  const request = async (): Promise<boolean> => {
    // ask for foreground
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    setStatus(fgStatus);

    if (fgStatus !== Location.PermissionStatus.GRANTED) {
      return false;
    }

    // ask for background
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    setBackgroundStatus(bgStatus);

    return bgStatus === Location.PermissionStatus.GRANTED;
  };

  const isGranted =
    status === Location.PermissionStatus.GRANTED &&
    backgroundStatus === Location.PermissionStatus.GRANTED;

  return { isGranted, check, request, status, backgroundStatus };
};
