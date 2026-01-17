import { Point } from 'geojson';
import { Geofence } from './geofence.interface';
import { User } from './user.interface';

export interface EventPayload {
  type: 'entry' | 'exit';
  userId: string;
  fenceId: string;
  location: Point;
  timestamp: string;
}

export interface Event {
  id: string;
  type: 'entry' | 'exit';
  user: User;
  fence: Geofence;
  location: Point;
  timestamp: string;
}
