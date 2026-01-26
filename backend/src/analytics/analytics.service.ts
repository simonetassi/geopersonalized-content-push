import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '@/events/entities/event.entity';
import { Geofence } from '@/geofences/entities/geofence.entity';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { EventType } from '@/events/common/event-type';
import { FeatureCollection } from 'geojson';
import { LatLonCoordinates } from '@/common/interfaces/lat-lon-coordinates.inteface';

export interface AnalyticsMetric {
  fenceId: string;
  name: string;
  entries: number;
  exits: number;
  views: number;
  avgDwellTimeMinutes: number;
  conversionRate: string;
  bounceRate: string;
  category?: string;
}

interface FenceStats {
  fenceId: string;
  name: string;
  entries: number;
  exits: number;
  views: number;
  totalDwellTimeMs: number;
  dwellCount: number;
}

interface CategoryMap {
  [fenceId: string]: string;
}

@Injectable()
export class AnalyticsService {
  public constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(Geofence) private fenceRepository: Repository<Geofence>,
  ) {}

  public async getHeatmapData(): Promise<FeatureCollection> {
    const rawPoints: LatLonCoordinates[] = await this.eventRepository.query(`
      SELECT ST_X(location) as lon, ST_Y(location) as lat
      FROM event 
      WHERE type = 'entry' AND timestamp > NOW() - INTERVAL '30 days'
    `);

    return {
      type: 'FeatureCollection',
      features: rawPoints.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
        properties: { weight: 1 },
      })),
    };
  }

  private async calculateRawStats(): Promise<Map<string, FenceStats>> {
    const allFences = await this.fenceRepository.find();
    const allEvents = await this.eventRepository.find({
      order: { timestamp: 'ASC' },
      relations: ['fence', 'user'],
    });

    const statsMap = new Map<string, FenceStats>();
    allFences.forEach((f) => {
      statsMap.set(f.id, {
        fenceId: f.id,
        name: f.name,
        entries: 0,
        exits: 0,
        views: 0,
        totalDwellTimeMs: 0,
        dwellCount: 0,
      });
    });

    const activeSessions = new Map<string, { fenceId: string; time: number }>();

    for (const event of allEvents) {
      const stats = event.fence ? statsMap.get(event.fence.id) : undefined;

      if (stats && event.user) {
        const userId = event.user.id;
        const fenceId = event.fence.id;
        const eventTime = new Date(event.timestamp).getTime();

        if (event.type === EventType.ENTRY) {
          stats.entries++;
          activeSessions.set(userId, { fenceId, time: eventTime });
        } else if (event.type === EventType.CONTENT_VIEW) {
          stats.views++;
        } else if (event.type === EventType.EXIT) {
          stats.exits++;

          const session = activeSessions.get(userId);

          if (session?.fenceId === fenceId) {
            const duration = eventTime - session.time;

            if (duration > 0 && duration < 86400000) {
              stats.totalDwellTimeMs += duration;
              stats.dwellCount++;
            }
            activeSessions.delete(userId);
          }
        }
      }
    }
    return statsMap;
  }

  private formatStats(stats: FenceStats, category?: string): AnalyticsMetric {
    const avgDwellSeconds =
      stats.dwellCount > 0
        ? stats.totalDwellTimeMs / stats.dwellCount / 1000
        : 0;
    const conversion =
      stats.entries > 0 ? (stats.views / stats.entries) * 100 : 0;
    const bounce =
      stats.entries > 0
        ? ((stats.entries - stats.views) / stats.entries) * 100
        : 0;

    return {
      fenceId: stats.fenceId,
      name: stats.name,
      entries: stats.entries,
      exits: stats.exits,
      views: stats.views,
      avgDwellTimeMinutes: parseFloat((avgDwellSeconds / 60).toFixed(1)),
      conversionRate: conversion.toFixed(1) + '%',
      bounceRate: bounce.toFixed(1) + '%',
      category: category,
    };
  }

  public async getMetricsOverview(): Promise<AnalyticsMetric[]> {
    const statsMap = await this.calculateRawStats();
    return Array.from(statsMap.values()).map((stat) => this.formatStats(stat));
  }

  public async runClusteringAnalysis(): Promise<{
    success: boolean;
    message?: string;
    data?: AnalyticsMetric[];
  }> {
    const statsMap = await this.calculateRawStats();

    if (statsMap.size < 3)
      return { success: false, message: 'Not enough data (min 3)' };

    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const csvPath = path.join(tempDir, `clustering_${Date.now()}.csv`);
    const header = 'fenceId,entries,views,dwell\n';
    let csvRows = '';

    statsMap.forEach((stat) => {
      const avgDwell =
        stat.dwellCount > 0
          ? stat.totalDwellTimeMs / stat.dwellCount / 1000
          : 0;
      csvRows += `${stat.fenceId},${stat.entries},${stat.views},${avgDwell}\n`;
    });

    fs.writeFileSync(csvPath, header + csvRows);

    const scriptPath = path.join(__dirname, '../../scripts/clustering.py');
    const pythonResult = await this.executePython(scriptPath, csvPath);

    if (!pythonResult.success) return pythonResult;

    const categoryMap: CategoryMap = JSON.parse(
      pythonResult.output,
    ) as CategoryMap;
    const results: AnalyticsMetric[] = [];

    statsMap.forEach((stat) => {
      const category: string = categoryMap[stat.fenceId] || 'UNKNOWN';
      results.push(this.formatStats(stat, category));
    });

    return { success: true, data: results };
  }

  private executePython(
    script: string,
    csv: string,
  ): Promise<{
    success: boolean;
    message?: string;
    output?: string;
  }> {
    return new Promise((resolve) => {
      const p = spawn('python3', [script, csv]);
      let out = '';
      p.stdout.on('data', (d: Buffer) => (out += d.toString()));
      p.on('close', (code) => {
        try {
          fs.unlinkSync(csv);
        } catch {
          /* ignore errors */
        }
        if (code !== 0) resolve({ success: false, message: 'Python Error' });
        else resolve({ success: true, output: out });
      });
    });
  }
}
