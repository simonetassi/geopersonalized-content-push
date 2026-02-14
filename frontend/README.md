# Admin Dashboard

## Description

A sophisticated administration dashboard designed to monitor the geofencing infrastructure and analyze user engagement. It provides a visual interface for managing spatial data and viewing real-time system activity.

## Technical Stack

- **Framework:** Angular
- **Styling:** Tailwind CSS
- **Charts:** Chart.js / Ng2-charts
- **Maps:** Leaflet with Geoman for spatial editing

## Key Functionalities

- **Geospatial Editor:** Interactive map interface for drawing, editing, and deleting polygonal geofences.
- **Live Analytics Tray:** Real-time visualization of system traffic, active users, and event logs via WebSockets.
- **Analysis Mode:** Integration with backend Python scripts to run K-Means clustering (identifying Hotspots vs. Cold areas).
- **Heatmap Visualization:** Dynamic rendering of high-traffic zones using `leaflet.heat`.
- **Security:** Role-based access control with a dedicated admin login flow and route guards.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm start
```
