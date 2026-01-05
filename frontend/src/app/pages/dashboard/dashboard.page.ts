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
    const { name, ...metadata } = data;
    const geojson = (this.tempLayer as L.Polygon).toGeoJSON();
    const newFence = {
      name: name,
      geometry: geojson.geometry,
      metadata: { ...metadata, isActive: true, privacyLevel: 1 },
    };

    this.geofenceService.addFence(newFence).subscribe({
      next: (created) => {
        console.log('Creato con successo:', created);
        this.closeCreation();
      },
      error: (err) => alert('Errore durante la creazione: ' + (err as Error).message),
    });
  }

  public handleSaveEdit(updated: Geofence): void {
    const currentGeometry = this.mapComponent.getLayerGeometry(updated.id);

    if (currentGeometry) {
      updated.geometry = currentGeometry;
    }

    this.geofenceService.updateFence(updated).subscribe({
      next: (saved) => {
        console.log('Aggiornato:', saved);
        this.selectedFence = undefined;
        this.isMapEditing = false;
      },
      error: (err) => alert("Errore durante l'aggiornamento: " + (err as Error).message),
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
          alert("Errore durante l'eliminazione: " + (err as Error).message);
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
