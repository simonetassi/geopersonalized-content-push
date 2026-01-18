import { Geofence } from './geofence.interface';

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  HTML = 'HTML',
  JSON = 'JSON',
  PDF = 'PDF',
}

export interface ContentMeta {
  id: string;
  fence: Geofence;
  type: ContentType;
  descriptor: string;
  repoUrl: string;
}
