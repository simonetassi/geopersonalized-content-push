import { AfterViewInit, Component, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { GeofencePanelComponent } from './components/geofences-panel/geofences-panel.component';
import { Geofence } from '@/common/interfaces';
import {
  CreateModalComponent,
  GeofenceFormData,
} from './components/create-modal/create-modal.component';
import { DetailPanelComponent } from './components/detail-panel/detail-panel.component';

interface ExtendedLayerOptions extends L.LayerOptions {
  id?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GeofencePanelComponent, CreateModalComponent, DetailPanelComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  public fences: Geofence[] = [
    {
      id: '1',
      name: 'Centro Commerciale "Il Centro"',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [9.06, 45.564],
            [9.065, 45.564],
            [9.065, 45.56],
            [9.06, 45.56],
            [9.06, 45.564],
          ],
        ],
      },
      metadata: { color: '#3b82f6', category: 'Retail', privacyLevel: 1, isActive: true },
    },
    {
      id: '2',
      name: 'Parco Sempione',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [9.173, 45.475],
            [9.178, 45.475],
            [9.178, 45.47],
            [9.173, 45.47],
            [9.173, 45.475],
          ],
        ],
      },
      metadata: { color: '#10b981', category: 'Park', privacyLevel: 0, isActive: true },
    },
    {
      id: '3',
      name: 'Area Riservata Linate',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [9.27, 45.465],
            [9.285, 45.465],
            [9.285, 45.455],
            [9.27, 45.455],
            [9.27, 45.465],
          ],
        ],
      },
      metadata: { color: '#ef4444', category: 'High Security', privacyLevel: 3, isActive: false },
    },
  ];

  public filteredFences: Geofence[] = [...this.fences];

  private map?: L.Map;
  private fencesGroup = L.featureGroup();

  public isCreating: boolean = false;
  public isModalOpen: boolean = false;
  private tempLayer?: L.Layer;

  public selectedFence?: Geofence;
  public isMapEditing = false;
  private currentEditingLayer?: L.Layer;

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  public ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.4642, 9.19],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.fencesGroup.addTo(this.map);
    this.displayFences();

    if (this.map) {
      this.map.pm.setGlobalOptions({ snappable: true });

      this.map.on('pm:create', (e) => {
        this.tempLayer = e.layer;
        this.openMetadataStep();
      });
    }
  }

  private displayFences(): void {
    if (!this.map) return;
    this.fencesGroup.clearLayers();

    for (const fence of this.fences) {
      const geojsonLayer = L.geoJSON(fence.geometry, {
        style: () => ({
          color: fence.metadata.color,
          fillColor: fence.metadata.color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.2,
        }),
      });

      (geojsonLayer.options as ExtendedLayerOptions).id = fence.id;

      geojsonLayer.bindTooltip(fence.name);

      geojsonLayer.on('click', () => {
        this.selectedFence = fence;
        this.map?.fitBounds(geojsonLayer.getBounds());
      });

      this.fencesGroup.addLayer(geojsonLayer);
    }

    if (this.fences.length > 0) {
      this.map.fitBounds(this.fencesGroup.getBounds(), { padding: [50, 50] });
    }
  }

  public startDrawing(): void {
    if (!this.map) return;
    this.isCreating = true;

    this.map.pm.enableDraw('Polygon', {
      snappable: true,
      cursorMarker: true,
    });
  }

  private openMetadataStep(): void {
    this.map?.pm.disableDraw();
    this.isModalOpen = true;
  }

  public handleModalSave(data: GeofenceFormData): void {
    if (!this.tempLayer) return;

    const geojson = (this.tempLayer as L.Polygon).toGeoJSON();

    const newFence = {
      name: data.name,
      geometry: geojson.geometry,
      metadata: {
        color: data.color,
        category: data.category,
        isActive: true,
        privacyLevel: 1,
      },
    };

    console.log(newFence);
    this.handleSearch('');
    this.displayFences();
    this.closeCreation();
  }

  public cancelCreation(): void {
    this.isCreating = false;
    this.isModalOpen = false;
    if (this.tempLayer && this.map) {
      this.map.removeLayer(this.tempLayer);
    }
    this.map?.pm.disableDraw();
  }

  private closeCreation(): void {
    this.isCreating = false;
    this.isModalOpen = false;
    this.tempLayer = undefined;
    this.map?.pm.disableDraw();
  }

  public handleSelect(fence: Geofence): void {
    if (this.isMapEditing) {
      this.stopMapEditing();
    }

    this.selectedFence = fence;

    if (!this.map) return;

    const targetLayer = this.findLayerById(fence.id);

    if (targetLayer && 'getBounds' in targetLayer) {
      const feature = targetLayer as L.FeatureGroup;
      this.map.flyToBounds(feature.getBounds(), {
        padding: [50, 50],
        duration: 1.5,
      });

      feature.openTooltip();
    }
  }

  public handleSearch(term: string): void {
    const query = term.toLowerCase().trim();

    if (!query) {
      this.filteredFences = [...this.fences];
    } else {
      this.filteredFences = this.fences.filter(
        (fence) =>
          fence.name.toLowerCase().includes(query) ||
          fence.metadata.category.toLowerCase().includes(query),
      );
    }
  }

  private findLayerById(id: string): L.Layer | undefined {
    return this.fencesGroup.getLayers().find((l) => {
      const options = l.options as ExtendedLayerOptions;
      return options.id === id;
    });
  }

  public onMapEditRequest(enable: boolean): void {
    if (!this.selectedFence || !this.map) return;

    const layer = this.findLayerById(this.selectedFence.id);
    if (!layer) return;

    if (enable) {
      this.isMapEditing = true;
      this.currentEditingLayer = layer;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      layer.pm.enable({ allowSelfIntersection: false, snappable: true });
    } else {
      this.stopMapEditing();
    }
  }

  private stopMapEditing(): void {
    if (this.currentEditingLayer && 'pm' in this.currentEditingLayer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.currentEditingLayer.pm.disable();
      this.currentEditingLayer = undefined;
    }
    this.isMapEditing = false;
  }

  public handleSaveEdit(updatedFence: Geofence): void {
    if (!this.map) return;

    const layer = this.findLayerById(updatedFence.id);
    if (layer && 'toGeoJSON' in layer) {
      const geojson = (layer as L.Polygon).toGeoJSON();
      updatedFence.geometry = geojson.geometry;
    }

    const index = this.fences.findIndex((f) => f.id === updatedFence.id);
    if (index !== -1) {
      this.fences[index] = updatedFence;

      // this.geofenceService.update(updatedFence).subscribe(...)

      console.log(updatedFence);
    }

    this.stopMapEditing();
    this.selectedFence = undefined;
    this.displayFences();
    this.handleSearch('');
  }

  public handleDelete(id: string): void {
    if (confirm('Sei sicuro di voler eliminare questo geofence?')) {
      this.fences = this.fences.filter((f) => f.id !== id);
      this.selectedFence = undefined;
      this.displayFences();
      this.handleSearch('');
      // this.geofenceService.delete(id).subscribe(...)
    }
  }
}
