// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as L from 'leaflet';

declare module 'leaflet' {
  interface Map {
    pm: import('@geoman-io/leaflet-geoman-free').PM.Map;
  }
  interface Layer {
    pm: import('@geoman-io/leaflet-geoman-free').PM.Layer;
  }
  interface FeatureGroup {
    pm: import('@geoman-io/leaflet-geoman-free').PM.Layer;
  }
  interface Polygon {
    pm: import('@geoman-io/leaflet-geoman-free').PM.Layer;
  }
}
