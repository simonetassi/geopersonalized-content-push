# Content Repository (Edge Node)

## Description

A lightweight, standalone service designed to be deployed at the network edge. It is responsible for the physical storage and delivery of content files, decoupling large asset management from the central proxy.

## Technical Stack

- **Runtime:** Node.js
- **Database:** SQLite (for local file metadata and TTL tracking)
- **Storage:** Local filesystem (mounted volumes in Docker/k8s)

## API Reference

- `GET /files/:id` - Download or stream a specific file by ID.
- `POST /upload` - Upload a new file. Accepts `multipart/form-data`. Optional `ttl` field for expiration.
- `GET /metadata/:id` - Retrieve local technical metadata for a file (size, mime-type, upload timestamp).

## Setup

```bash
# Install dependencies
npm install

# Run server
npm start
```
