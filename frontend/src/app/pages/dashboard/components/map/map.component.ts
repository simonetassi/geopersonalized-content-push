import { Geofence } from '@/common/interfaces';
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

  @Input() public geofences: Geofence[] = [];
  @Input() public selectedFenceId?: string;
  @Input() public isDrawing = false;
  @Input() public editMode = false;

  @Output() public fenceClicked = new EventEmitter<Geofence>();
  @Output() public shapeCreated = new EventEmitter<L.Layer>();

  private map?: L.Map;
  private fencesGroup = L.featureGroup();

  private lastEditedLayer?: L.Layer;

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.initMap();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['fences'] && this.map) this.displayFences();
    if (changes['isDrawing'] && this.map) this.toggleDrawing();
    if ((changes['editMode'] || changes['selectedFenceId']) && this.map) this.toggleEditing();
  }

  private initMap(): void {
    this.map = L.map('map', { center: [45.4642, 9.19], zoom: 12 });
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
}
