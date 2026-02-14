# Backend Service

## Description

The backend serves as the central Geo-Aware Proxy. It is built with NestJS and utilizes TypeORM with PostGIS for high-performance spatial queries. It manages the core business logic, including geofence definitions, user sessions, and analytics aggregation.

## Technical Stack

- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with PostGIS extension
- **Documentation:** Swagger (OpenAPI 3.0)
- **Communication:** REST API and WebSockets (Socket.io)

## API Reference

### Geofences

- `GET /geofences` - Retrieve all defined geofences.
- `GET /geofences/active` - Retrieve only geofences that have valid, non-expired content.
- `GET /geofences/:id` - Retrieve a specific geofence by ID.
- `POST /geofences` - Create a new geofence with geometry and metadata.
- `PATCH /geofences/:id` - Update an existing geofence.
- `DELETE /geofences/:id` - Delete a geofence (cascades to associated content metadata).

### Content Metadata

- `GET /content-meta` - List all content metadata entries.
- `GET /content-meta/by-coords` - Find content metadata relevant to specific GPS coordinates.
- `GET /content-meta/:id` - Retrieve specific content metadata.
- `GET /content/:id` - Redirect to the actual file URL on the appropriate Content Repository.
- `POST /content-meta` - Create metadata and associate it with a geofence.
- `PATCH /content-meta/:id` - Update content metadata.
- `DELETE /content-meta/:id` - Delete content metadata.

### Events & Analytics

- `GET /events` - Retrieve global event history (entries, exits, views).
- `POST /events` - Log a new user event.
- `DELETE /events` - Wipe all event history.
- `GET /analytics/heatmap` - Retrieve weighted coordinate data for heatmap visualization.
- `GET /analytics/clustering` - Trigger K-Means analysis on geofence engagement.
- `GET /analytics/metrics` - Retrieve aggregated performance metrics.

### Privacy Analysis

- `POST /privacy-analysis/simulate/:fenceId` - Run location perturbation simulations on a specific geofence.
- `GET /privacy-analysis/export` - Export privacy experiment logs as CSV.
- `DELETE /privacy-analysis` - Wipe privacy analysis data.

### Users

- `POST /users/register` - Register a new user account.
- `POST /users/login` - Authenticate and receive a JWT.
- `GET /users` - List all users (Admin only).
- `PATCH /users/:id` - Update user details.
- `DELETE /users/:id` - Delete a user.

## Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev
```
