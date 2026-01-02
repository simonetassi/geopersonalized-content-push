import { AfterViewInit, Component, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { GeofencePanelComponent } from './components/geofences-panel/geofences-panel.component';
import { Geofence } from '@/common/interfaces';

interface ExtendedLayerOptions extends L.LayerOptions {
  id?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GeofencePanelComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  public activeFenceId: string | undefined;

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
        this.activeFenceId = fence.id;
        this.map?.fitBounds(geojsonLayer.getBounds());
      });

      this.fencesGroup.addLayer(geojsonLayer);
    }

    if (this.fences.length > 0) {
      this.map.fitBounds(this.fencesGroup.getBounds(), { padding: [50, 50] });
    }
  }

  public handleSelect(fence: Geofence): void {
    this.activeFenceId = fence.id;

    if (!this.map) return;

    const layers = this.fencesGroup.getLayers();

    const targetLayer = layers.find((l) => {
      const options = l.options as ExtendedLayerOptions;
      return options.id === fence.id;
    });

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

  public openCreateModal(): void {
    console.log('Open modal logic here');
  }
}
