export interface FileRecord {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  created_at: number;
  ttl: number;
  expires_at: number;
}
