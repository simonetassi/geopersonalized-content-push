import { Geometry } from 'geojson';
import { ContentMeta } from './content-meta.interface';

export interface Geofence {
  id: string;
  name: string;
  geometry: Geometry;
  metadata: Record<string, unknown>;
  contents: ContentMeta[];
}
