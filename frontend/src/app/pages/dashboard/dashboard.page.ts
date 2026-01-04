import { Component, inject, ViewChild } from '@angular/core';
import { GeofencePanelComponent } from './components/geofences-panel/geofences-panel.component';
import { Geofence } from '@/common/interfaces';
import {
  CreateModalComponent,
  GeofenceFormData,
} from './components/create-modal/create-modal.component';
import { DetailPanelComponent } from './components/detail-panel/detail-panel.component';
import { MapComponent } from './components/map/map.component';
import { GeofenceService } from '@/common/services/geofences.service';
import { AsyncPipe } from '@angular/common';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    GeofencePanelComponent,
    CreateModalComponent,
    DetailPanelComponent,
    MapComponent,
    AsyncPipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  public selectedFence?: Geofence;
  public isCreating = false;
  public isModalOpen = false;
  public isMapEditing = false;
  private tempLayer?: L.Layer;

  public geofenceService = inject(GeofenceService);

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
    const geojson = (this.tempLayer as L.Polygon).toGeoJSON();
    const newFence = {
      name: data.name,
      geometry: geojson.geometry,
      metadata: { ...data, isActive: true, privacyLevel: 1 },
    };
    this.geofenceService.addFence(newFence);
    this.closeCreation();
  }

  public handleSaveEdit(updated: Geofence): void {
    this.geofenceService.updateFence(updated);
    this.isMapEditing = false;
    this.selectedFence = undefined;
  }

  public handleDelete(id: string): void {
    if (confirm('Delete?')) {
      this.geofenceService.deleteFence(id);
      this.selectedFence = undefined;
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
