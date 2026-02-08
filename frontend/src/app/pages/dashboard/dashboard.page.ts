import { Component, inject, ViewChild } from '@angular/core';
import { GeofencePanelComponent } from './components/geofences-panel/geofences-panel.component';
import { Geofence } from '@/common/interfaces';
import {
  CreateModalComponent,
  GeofenceFormData,
} from './components/create-modal/create-modal.component';
import { DetailPanelComponent } from './components/detail-panel/detail-panel.component';
import { MapComponent } from './components/map/map.component';
import { AsyncPipe } from '@angular/common';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { GeofencesService } from '@/common/services/geofences.service';
import { EventsService } from '@/common/services/events.service';
import { AnalyticsComponent } from './components/analytics/analytics.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    GeofencePanelComponent,
    CreateModalComponent,
    DetailPanelComponent,
    MapComponent,
    AsyncPipe,
    AnalyticsComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  @ViewChild(MapComponent)
  public mapComponent!: MapComponent;

  public selectedFence?: Geofence;
  public isCreating: boolean = false;
  public isModalOpen: boolean = false;
  public isMapEditing: boolean = false;
  private tempLayer?: L.Layer;
  public liveUsersCount: number = 0;

  public geofenceService = inject(GeofencesService);
  public eventsService = inject(EventsService);

  public constructor() {
    this.eventsService.latestEvents$.subscribe((events) => {
      if (events.length > 0) {
        const lastEvent = events[0];
        this.mapComponent.pulseGeofence(lastEvent.fence.id, lastEvent.type);
      }
    });
  }

  public handleSelect(fence: Geofence): void {
    this.selectedFence = fence;
    this.isMapEditing = false;
    this.mapComponent.flyTo(fence.id);
  }

  public startDrawing(): void {
    this.isCreating = true;
    this.selectedFence = undefined;
  }

  public onShapeCreated(layer: L.Layer): void {
    this.tempLayer = layer;
    this.isCreating = false;
    this.isModalOpen = true;
  }

  public handleModalSave(data: GeofenceFormData): void {
    const { name, ...metadata } = data;
    const geojson = (this.tempLayer as L.Polygon).toGeoJSON();
    const newFence = {
      name: name,
      geometry: geojson.geometry,
      metadata: metadata,
    };

    this.geofenceService.addFence(newFence).subscribe({
      next: () => {
        if (this.tempLayer) this.tempLayer.remove();

        this.closeCreation();
      },
      error: (err) => alert('Error during creation: ' + (err as Error).message),
    });
  }

  public handleSaveEdit(updated: Geofence): void {
    const currentGeometry = this.mapComponent.getLayerGeometry(updated.id);

    if (currentGeometry) {
      updated.geometry = currentGeometry;
    }

    this.geofenceService.updateFence(updated).subscribe({
      next: () => {
        this.selectedFence = undefined;
        this.isMapEditing = false;
      },
      error: (err) => alert('Error during update: ' + (err as Error).message),
    });
  }

  public handleDelete(id: string): void {
    if (
      confirm(
        'Warning: by deleting this Geofence you will also delete all metadata of associated content. Confirm?',
      )
    ) {
      this.geofenceService.deleteFence(id).subscribe({
        next: () => {
          this.selectedFence = undefined;
        },
        error: (err) => {
          alert('Errore during deletion: ' + (err as Error).message);
        },
      });
    }
  }

  public cancelCreation(): void {
    if (this.tempLayer) this.tempLayer.remove();
    this.closeCreation();
  }

  private closeCreation(): void {
    this.isCreating = false;
    this.isModalOpen = false;
    this.tempLayer = undefined;
  }
}
