import path from "path";
import fs from "fs-extra";
import Database from "better-sqlite3";

const dbPath = path.join(__dirname, '../metadata.db');

fs.ensureDirSync(path.dirname(dbPath));

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT,
    storage_path TEXT,
    mime_type TEXT,
    size INTEGER,
    created_at INTEGER,
    ttl INTEGER,
    expires_at INTEGER
  );
`)

export default db;
