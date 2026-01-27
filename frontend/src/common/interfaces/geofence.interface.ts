import { Geometry } from 'geojson';
import { ContentMeta } from './content-meta.interface';

export interface Geofence {
  id: string;
  name: string;
  geometry: Geometry;
  metadata: GeofenceMetadata;
  contents: ContentMeta[];
}

export interface GeofenceMetadata {
  color: string;
  category: string;
  [key: string]: unknown;
}
