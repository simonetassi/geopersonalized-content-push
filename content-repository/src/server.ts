import fastifyMultipart from '@fastify/multipart';
import Fastify, { FastifyInstance } from 'fastify'
import path from 'path';
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { pipeline } from 'stream/promises';
import { FileRecord } from './interfaces/file-record.interface';

const fastify: FastifyInstance = Fastify({
  logger: true
});

fastify.register(fastifyMultipart);

const STORAGE_DIR = path.join(__dirname, '../storage');
fs.ensureDirSync(STORAGE_DIR);

// UPLOAD
fastify.post<{Headers: {'x-ttl-seconds'?: number}}>('/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({error: 'No file uploaded'});
  }

  const fileId = uuidv4();
  const ext = path.extname(data.filename);
  const diskPath = path.join(STORAGE_DIR, `${fileId}${ext}`);

  const ttlHeader = request.headers['x-ttl-seconds'];
  const ttlSeconds = ttlHeader ? parseInt(ttlHeader.toString()) : null;
  const now = Date.now();
  const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
  
  // directly connect stream to diskPath
  await pipeline(
    data.file,
    fs.createWriteStream(diskPath) 
  );

  const stats = await fs.stat(diskPath);

  const insert = db.prepare(`
    INSERT INTO files (id, filename, storage_path, mime_type, size, created_at, ttl, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insert.run(fileId, data.filename, diskPath, data.mimetype, stats.size, now, ttlSeconds, expiresAt);

  return { id: fileId, ttl: ttlSeconds, expires_at: expiresAt ? new Date(expiresAt) : null }; 
});

// GET FILE 
fastify.get<{Params: {id: string}}>('/files/:id', async (request, reply) => {
  const {id} = request.params;

  const meta = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
  if (!meta) {
    return reply.status(404).send({error: 'File not found'});
  }

  if (meta.expires_at !== null && Date.now() > meta.expires_at){
    return reply.status(410).send({error: 'Content Expired'});
  } 

  const stream =  fs.createReadStream(meta.storage_path);

  reply.header('Content-Type', meta.mime_type);
  reply.header('Content-Length', meta.size);

  return reply.send(stream);
});

// GET METADATA
fastify.get<{Params: {id: string}}>('/files/:id/meta', async (request, reply) => {
  const meta = db.prepare('SELECT * FROM files WHERE id = ?').get(request.params.id) as FileRecord | undefined;
  
  if (!meta) {
    return reply.status(404).send({error: 'Not found'});
  }

  return {
    ...meta,
    is_expired: Date.now() > meta?.expires_at,
  }
})

const start = async () => {
  const port = 3000;
  try {
    // using 0.0.0.0 instead of localhost to make it work with docker
    await fastify.listen({ port: port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
