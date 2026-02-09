import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { Geofence } from '../interfaces';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GeofencesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/geofences`;

  private fences$ = new BehaviorSubject<Geofence[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');

  public filteredFences$ = combineLatest([this.fences$, this.searchTerm$]).pipe(
    map(([fences, term]) => {
      const query = term.toLowerCase().trim();
      if (!query) return fences;
      return fences.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.metadata?.category?.toLowerCase().includes(query),
      );
    }),
  );

  public constructor() {
    this.load();
  }

  public load(): void {
    this.http.get<Geofence[]>(this.baseUrl).subscribe((data) => {
      this.fences$.next(data);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, contents, ...payload } = updated;

    return this.http.patch<Geofence>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((saved) => {
        const current = this.fences$.value;
        const index = current.findIndex((f) => f.id === saved.id);
        if (index !== -1) {
          const existingContents = current[index].contents;

          current[index] = { ...saved, contents: saved.contents || existingContents };

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
