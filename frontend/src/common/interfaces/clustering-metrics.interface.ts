export interface ClusteringMetrics {
  fenceId: string;
  name: string;
  entries: number;
  views: number;
  avgDwellTimeMinutes: number;
  conversionRate: string;
  bounceRate: string;
  category: 'HOTSPOT' | 'COLD' | 'STANDARD' | 'UNKNOWN';
}
