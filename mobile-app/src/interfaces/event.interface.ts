import { Point } from 'geojson';
import { Geofence } from './geofence.interface';
import { User } from './user.interface';

export interface EventPayload {
  type: 'entry' | 'exit' | 'content_view';
  userId: string;
  fenceId: string;
  location: Point;
  timestamp: string;
}

export interface Event {
  id: string;
  type: 'entry' | 'exit' | 'content_view';
  user: User;
  fence: Geofence;
  location: Point;
  timestamp: string;
}
