import { Geometry } from 'geojson';

export interface Geofence {
  id: string;
  name: string;
  geometry: Geometry;
  metadata: GeofenceMetadata;
}

export interface GeofenceMetadata {
  color: string;
  category: string;
  privacyLevel: number;
  isActive: boolean;
  [key: string]: unknown;
}
