import { EventType, Geofence } from '@/common/interfaces';
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { FeatureCollection, Geometry, Point } from 'geojson';
import { firstValueFrom } from 'rxjs';
import { AnalyticsService } from '@/common/services/analytics.service';

interface ExtendedLayerOptions extends L.LayerOptions {
  id?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnChanges {
  private platformId = inject(PLATFORM_ID);
  private analyticsService = inject(AnalyticsService);

  @Input() public geofences: Geofence[] = [];
  @Input() public selectedFenceId?: string;
  @Input() public isDrawing = false;
  @Input() public editMode = false;

  @Output() public fenceClicked = new EventEmitter<Geofence>();
  @Output() public shapeCreated = new EventEmitter<L.Layer>();

  private map?: L.Map;
  private fencesGroup = L.featureGroup();

  private heatmapLayer?: L.Layer;
  public isHeatmapActive: boolean = false;

  private lastEditedLayer?: L.Layer;

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.initMap();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['geofences'] && this.map) this.displayFences();
    if (changes['isDrawing'] && this.map) this.toggleDrawing();
    if ((changes['editMode'] || changes['selectedFenceId']) && this.map) this.toggleEditing();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [40.75, -73.99],
      zoom: 12,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.fencesGroup.addTo(this.map);
    this.map.pm.setGlobalOptions({ snappable: true });

    this.map.on('pm:create', (e) => this.shapeCreated.emit(e.layer));
    this.displayFences();
  }

  private displayFences(): void {
    this.fencesGroup.clearLayers();
    this.geofences.forEach((fence) => {
      const layer = L.geoJSON(fence.geometry, {
        style: () => ({
          color: fence.metadata.color,
          fillColor: fence.metadata.color,
          weight: 2,
          fillOpacity: 0.2,
        }),
      });
      (layer.options as ExtendedLayerOptions).id = fence.id;
      layer.on('click', () => this.fenceClicked.emit(fence));
      this.fencesGroup.addLayer(layer);
    });
  }

  public flyTo(id: string): void {
    const layer = this.fencesGroup
      .getLayers()
      .find((l) => (l.options as ExtendedLayerOptions).id === id);
    if (layer && 'getBounds' in layer) {
      this.map?.flyToBounds((layer as L.FeatureGroup).getBounds(), { padding: [100, 100] });
    }
  }

  private toggleDrawing(): void {
    if (this.isDrawing) this.map?.pm.enableDraw('Polygon');
    else this.map?.pm.disableDraw();
  }

  private toggleEditing(): void {
    if (this.lastEditedLayer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.lastEditedLayer.pm.disable();
      this.lastEditedLayer = undefined;
    }

    if (this.editMode && this.selectedFenceId) {
      const layer = this.fencesGroup
        .getLayers()
        .find((l) => (l.options as ExtendedLayerOptions).id === this.selectedFenceId);

      if (layer) {
        this.lastEditedLayer = layer;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        layer.pm.enable({
          allowSelfIntersection: false,
          snappable: true,
        });
      }
    }
  }

  public getLayerGeometry(id: string): Geometry | null {
    const layer = this.fencesGroup
      .getLayers()
      .find((l) => (l.options as ExtendedLayerOptions).id === id);

    if (layer && 'toGeoJSON' in layer) {
      const geojson = (layer as L.FeatureGroup).toGeoJSON();
      if (geojson.type === 'FeatureCollection')
        return (geojson as FeatureCollection).features[0].geometry;
      else if (geojson.type === 'Feature') return geojson.geometry;
    }
    return null;
  }

  public pulseGeofence(fenceId: string, type: EventType): void {
    const layer = this.fencesGroup
      .getLayers()
      .find((l) => (l.options as ExtendedLayerOptions).id === fenceId) as L.Path;

    const originalFence = this.geofences.find((f) => f.id === fenceId);

    if (layer && originalFence && 'setStyle' in layer) {
      const originalColor = originalFence.metadata.color;
      let pulseColor: string;

      switch (type) {
        case EventType.ENTRY:
          pulseColor = '#10b981';
          break;
        case EventType.EXIT:
          pulseColor = '#ef4444';
          break;
        case EventType.CONTENT_VIEW:
          pulseColor = '#3b82f6';
          break;
        default:
          pulseColor = '#f59e0b';
      }

      layer.setStyle({
        fillOpacity: 0.8,
        fillColor: pulseColor,
        color: pulseColor,
        weight: 4,
      });

      setTimeout(() => {
        layer.setStyle({
          fillColor: originalColor,
          color: originalColor,
          fillOpacity: 0.2,
          weight: 2,
        });
      }, 1000);
    }
  }

  private async loadHeatmapLayer(): Promise<void> {
    if (!this.map) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!(L as any).heatLayer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (window as any).L = L;
      await import('leaflet.heat');
    }

    try {
      const geoJsonData = await firstValueFrom(this.analyticsService.getHeatmapData());

      const collection = geoJsonData as FeatureCollection<Point>;

      const heatPoints = collection.features.map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        return [lat, lon, 1] as [number, number, number];
      });

      this.heatmapLayer = L.heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: 'blue',
          0.65: 'lime',
          1: 'red',
        },
      });

      if (this.heatmapLayer) {
        this.map.addLayer(this.heatmapLayer);
      }
    } catch (error) {
      console.error('Failed to load heatmap data', error);
      this.isHeatmapActive = false;
    }
  }

  public async toggleHeatmap(): Promise<void> {
    if (!this.map) return;

    this.isHeatmapActive = !this.isHeatmapActive;

    if (this.isHeatmapActive) {
      if (!this.heatmapLayer) {
        await this.loadHeatmapLayer();
      } else {
        this.map.addLayer(this.heatmapLayer);
      }
    } else {
      if (this.heatmapLayer) {
        this.map.removeLayer(this.heatmapLayer);
      }
    }
  }
}
