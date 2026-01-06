import { Point } from 'geojson';
import { User, Geofence } from '../interfaces';

export enum EventType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

export interface Event {
  id: string;
  type: EventType;
  user: User;
  fence: Geofence;
  location: Point;
  timestamp: Date;
}
