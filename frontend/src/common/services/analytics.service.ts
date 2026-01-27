import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Observable } from 'rxjs';
import { FeatureCollection } from 'geojson';
import { ClusteringMetrics } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  public getHeatmapData(): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>(`${this.apiUrl}/heatmap`);
  }

  public getClusteringData(): Observable<ClusteringMetrics[]> {
    return this.http.get<ClusteringMetrics[]>(`${this.apiUrl}/clustering`);
  }
}
