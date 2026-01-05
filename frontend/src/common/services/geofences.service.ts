import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Geofence } from '../interfaces';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GeofenceService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/geofences`;

  private fences$ = new BehaviorSubject<Geofence[]>([]);
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

  public constructor() {
    this.load();
  }

  public load(): void {
    this.http.get<Geofence[]>(this.baseUrl).subscribe((data) => {
      this.fences$.next(data);
      console.log(data);
    });
  }

  public setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  public addFence(newFence: Partial<Geofence>): Observable<Geofence> {
    return this.http.post<Geofence>(this.baseUrl, newFence).pipe(
      tap((created) => {
        const current = this.fences$.value;
        this.fences$.next([...current, created]);
      }),
    );
  }

  public updateFence(updated: Geofence): Observable<Geofence> {
    const { id, ...payload } = updated;

    console.log(payload);

    return this.http.patch<Geofence>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((saved) => {
        const current = this.fences$.value;
        const index = current.findIndex((f) => f.id === saved.id);
        if (index !== -1) {
          current[index] = saved;
          this.fences$.next([...current]);
        }
      }),
    );
  }

  public deleteFence(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this.fences$.value;
        this.fences$.next(current.filter((f) => f.id !== id));
      }),
    );
  }
}
