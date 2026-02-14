# Geo-Personalized Content Push

## Introduction

This project implements a complete location-aware ecosystem designed to push personalized content (coupons, promotions, media) to users based on their geographic position. The system utilizes a proxy-based architecture where a central backend manages geofences and metadata, while distributed edge nodes (Content Repositories) serve the physical assets.

## Repository Structure

- **backend/**: NestJS proxy server managing spatial data (PostGIS), user authentication, and event logging.
- **frontend/**: Angular-based administration dashboard for geofence management and real-time analytics.
- **mobile-app/**: React Native (Expo) application for background geofence monitoring and content consumption.
- **content-repository/**: Lightweight Node.js service acting as an edge server for asset storage.
- **k8s/**: Kubernetes manifests for geo-distributed deployment.
- **privacy-analysis/**: Python scripts for evaluating location cloaking metrics.

## Core Features

- **Spatial Intelligence:** Circular and polygonal geofencing using PostGIS and Leaflet.
- **Real-time Monitoring:** WebSocket integration for live entry/exit visualization.
- **Privacy-Preserving:** Implementation of location cloaking (perturbation) with ~110m grid snapping.
- **Edge Computing:** Distributed content delivery via Kubernetes.
- **Advanced Analytics:** K-Means clustering of engagement metrics and heatmap generation.

## Orchestration

The entire stack can be deployed using Docker Compose for local development.

```bash
# Start all services
docker-compose up -d --build
```
