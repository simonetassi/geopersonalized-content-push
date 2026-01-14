import { Geofence } from '@/interfaces';
import { api } from './client';

export const getGeofences = async (): Promise<Geofence[]> => {
  try {
    const response = await api.get<Geofence[]>('/geofences');
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
