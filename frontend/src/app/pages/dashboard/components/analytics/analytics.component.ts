import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ClusteringMetrics, Event, EventType } from '@/common/interfaces';
import { AnalyticsService } from '@/common/services/analytics.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [BaseChartDirective, DatePipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnChanges {
  private analyticsService = inject(AnalyticsService);

  @Input()
  public events: Event[] = [];

  public isExpanded: boolean = false;
  public isAnalyzing = false;
  public analysisResults: ClusteringMetrics[] = [];
  public viewMode: 'LIVE' | 'ANALYSIS' = 'LIVE';

  public entryCount: number = 0;
  public exitCount: number = 0;
  public contentViewCount: number = 0;

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Entries',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
      {
        data: [],
        label: 'Exits',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
      {
        data: [],
        label: 'Views',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Interactions', backgroundColor: '#6366f1', borderRadius: 6 }],
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 9 } },
      },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
    },
  };

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.events) {
      this.refreshAnalytics();
    }
  }

  private refreshAnalytics(): void {
    this.updateCounters();
    this.updateLineChart();
    this.updateBarChart();
  }

  private updateCounters(): void {
    this.entryCount = this.events.filter((e) => e.type === EventType.ENTRY).length;
    this.exitCount = this.events.filter((e) => e.type === EventType.EXIT).length;
    this.contentViewCount = this.events.filter((e) => e.type === EventType.CONTENT_VIEW).length;
  }

  private updateLineChart(): void {
    const now = new Date();
    const labels: string[] = [];
    const entries: number[] = [];
    const exits: number[] = [];
    const views: number[] = [];

    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      const inThisMinute = (e: Event) => this.isSameMinute(new Date(e.timestamp), time);

      entries.push(this.events.filter((e) => e.type === EventType.ENTRY && inThisMinute(e)).length);
      exits.push(this.events.filter((e) => e.type === EventType.EXIT && inThisMinute(e)).length);
      views.push(
        this.events.filter((e) => e.type === EventType.CONTENT_VIEW && inThisMinute(e)).length,
      );
    }

    this.lineChartData = {
      labels,
      datasets: [
        { ...this.lineChartData.datasets[0], data: entries },
        { ...this.lineChartData.datasets[1], data: exits },
        { ...this.lineChartData.datasets[2], data: views },
      ],
    };
  }

  private updateBarChart(): void {
    const idToCount = new Map<string, number>();
    const idToName = new Map<string, string>();

    this.events.forEach((e) => {
      const id = e.fence.id;
      const currentName = e.fence.name;

      idToCount.set(id, (idToCount.get(id) || 0) + 1);

      if (!idToName.has(id)) {
        idToName.set(id, currentName);
      }
    });

    const sortedStats = Array.from(idToCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sortedStats.map((stat) => idToName.get(stat[0]) || 'Unknown');
    const data = sortedStats.map((stat) => stat[1]);

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: data,
        },
      ],
    };
  }

  public async runAnalysis(): Promise<void> {
    this.viewMode = 'ANALYSIS';
    this.isAnalyzing = true;

    try {
      this.analysisResults = await firstValueFrom(this.analyticsService.getClusteringData());
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  public getCategoryColor(category: string): string {
    switch (category) {
      case 'HOTSPOT':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'COLD':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      case 'STANDARD':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  public switchToLive(): void {
    this.viewMode = 'LIVE';
  }

  private isSameMinute(d1: Date, d2: Date): boolean {
    return d1.getHours() === d2.getHours() && d1.getMinutes() === d2.getMinutes();
  }

  public toggleTray(): void {
    this.isExpanded = !this.isExpanded;
  }
}
