import * as turf from '@turf/turf';
import { getCenter, getDistance } from 'geolib';
import { Geofence } from '@/interfaces';
import { Polygon } from 'geojson';

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface CircularRegion {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export const convertPolygonToCircle = (id: string, geometry: Polygon): CircularRegion | null => {
  try {
    const coordinates = geometry.coordinates;

    if (!coordinates || coordinates.length === 0) {
      console.warn(`[Geometry] Empty coordinates for ID: ${id}`);
      return null;
    }

    const vertices: LatLng[] = coordinates[0].map((coord: number[]) => ({
      longitude: coord[0],
      latitude: coord[1],
    }));

    const center = getCenter(vertices);

    if (!center) {
      console.warn(`[Geometry] Could not calculate center for ID: ${id}`);
      return null;
    }

    let maxDistance = 0;
    vertices.forEach(vertex => {
      const dist = getDistance(center, vertex);
      if (dist > maxDistance) maxDistance = dist;
    });

    const radius = Math.ceil(maxDistance * 1.1);

    return {
      identifier: id,
      latitude: center.latitude,
      longitude: center.longitude,
      radius: radius > 100 ? radius : 100,
    };
  } catch (error: unknown) {
    console.error('Geometry conversion error:', error);
    return null;
  }
};

export const isPointInPolygon = (userLat: number, userLon: number, geofence: Geofence): boolean => {
  if (geofence.geometry.type !== 'Polygon') {
    console.warn(`[GeofenceUtils] Invalid Geometry Type: ${geofence.geometry.type}`);
    return false;
  }

  const geometry = geofence.geometry;

  try {
    const point = turf.point([userLon, userLat]);
    const polygonFeature = turf.feature(geometry);

    return turf.booleanPointInPolygon(point, polygonFeature);
  } catch (error: unknown) {
    console.error('[Geofence] Turf calculation error:', error);
    return false;
  }
};
