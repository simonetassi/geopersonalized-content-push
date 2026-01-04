import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Geofence } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class GeofenceService {
  private fences$ = new BehaviorSubject<Geofence[]>([
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
  ]);

  private searchTerm$ = new BehaviorSubject<string>('');

  public filteredFences$ = this.fences$.pipe(
    map((fences) => {
      const term = this.searchTerm$.value.toLowerCase().trim();
      if (!term) return fences;
      return fences.filter(
        (f) =>
          f.name.toLowerCase().includes(term) || f.metadata.category.toLowerCase().includes(term),
      );
    }),
  );

  public setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  public addFence(fence: Partial<Geofence>): void {
    console.log(fence);
  }

  public updateFence(updated: Geofence): void {
    const current = this.fences$.value;
    const index = current.findIndex((f) => f.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      this.fences$.next([...current]);
    }
  }

  public deleteFence(id: string): void {
    this.fences$.next(this.fences$.value.filter((f) => f.id !== id));
  }
}
