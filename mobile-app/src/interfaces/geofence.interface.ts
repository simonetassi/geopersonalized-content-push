import { Geometry } from 'geojson';

export interface Geofence {
  id: string;
  name: string;
  geometry: Geometry;
  metadata: Record<string, unknown>;
}
