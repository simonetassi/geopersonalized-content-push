# Mobile Application

## Description

A cross-platform mobile application that acts as the primary interface for the end-user. It handles efficient background location monitoring and delivers content when users enter defined zones.

## Technical Stack

- **Framework:** React Native (Expo)
- **State Management:** Zustand
- **Geospatial Engine:** Turf.js and Geolib

## Key Functionalities

- **Dual-Stage Geofencing:** Utilizes a circular buffer for low-power proximity detection and switches to high-precision polygon checks for exact entry/exit events.
- **Offline Support:** Automatically prefetches content metadata and caches assets locally when entering a geofence's influence zone.
- **User Privacy:** Features a "Location Cloaking" toggle that snaps user coordinates to a grid before transmission to the backend, preserving anonymity.
- **Content Viewer:** Integrated viewer for consuming PDF, Image, and Video content directly within the app.
- **Event History:** Local storage and visualization of the user's past geofence interactions.

## Setup

```bash
# Install dependencies
npm install

# Run on Android/iOS
npx expo run:android
npx expo run:ios
```
