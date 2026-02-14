import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacyAnalysisLog } from './entities/privacy-analysis-log.entity';
import { Geofence } from '@/geofences/entities/geofence.entity';

interface DistanceResult {
  meters: number;
}

interface BoundingBoxResult {
  min_lon: string | number;
  max_lon: string | number;
  min_lat: string | number;
  max_lat: string | number;
}

interface SimulationResult {
  success: boolean;
  count: number;
  message: string;
}

@Injectable()
export class PrivacyAnalysisService {
  constructor(
    @InjectRepository(PrivacyAnalysisLog)
    private logsRepository: Repository<PrivacyAnalysisLog>,
    @InjectRepository(Geofence)
    private fenceRepository: Repository<Geofence>,
  ) {}

  // exact same mobile app logic
  private applyCloaking(
    lat: number,
    lon: number,
  ): { pLat: number; pLon: number } {
    const GRID_SIZE = 0.001;
    const pLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
    const pLon = Math.floor(lon / GRID_SIZE) * GRID_SIZE;
    return {
      pLat: Number(pLat.toFixed(5)),
      pLon: Number(pLon.toFixed(5)),
    };
  }

  async runSimulation(
    fenceId: string,
    iterations: number = 1000,
  ): Promise<SimulationResult> {
    const fence = await this.fenceRepository.findOneBy({ id: fenceId });
    if (!fence) throw new NotFoundException('Fence not found');

    const boundsRes = await this.fenceRepository.query<BoundingBoxResult[]>(
      `SELECT 
         ST_XMin(geometry) as min_lon, 
         ST_XMax(geometry) as max_lon, 
         ST_YMin(geometry) as min_lat, 
         ST_YMax(geometry) as max_lat 
       FROM geofence WHERE id = $1`,
      [fenceId],
    );

    const GRID_SIZE = 0.001;
    const BUFFER = GRID_SIZE * 2;

    const minLon = Number(boundsRes[0].min_lon) - BUFFER;
    const maxLon = Number(boundsRes[0].max_lon) + BUFFER;
    const minLat = Number(boundsRes[0].min_lat) - BUFFER;
    const maxLat = Number(boundsRes[0].max_lat) + BUFFER;

    const logs: PrivacyAnalysisLog[] = [];

    for (let i = 0; i < iterations; i++) {
      const realLon = minLon + Math.random() * (maxLon - minLon);
      const realLat = minLat + Math.random() * (maxLat - minLat);

      const { pLat, pLon } = this.applyCloaking(realLat, realLon);

      const distRes: DistanceResult[] = await this.fenceRepository.query(
        `SELECT ST_Distance(
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
         ) as meters`,
        [realLon, realLat, pLon, pLat],
      );

      const errorMeters = Number(distRes[0].meters);

      const isRealInside: boolean = await this.checkInside(
        fenceId,
        realLat,
        realLon,
      );
      const isPerturbedInside: boolean = await this.checkInside(
        fenceId,
        pLat,
        pLon,
      );

      const qosRetained = isRealInside === isPerturbedInside;

      const log = this.logsRepository.create({
        realLat,
        realLon,
        perturbedLat: pLat,
        perturbedLon: pLon,
        errorMeters,
        isRealInside,
        isPerturbedInside,
        qosRetained,
      });
      logs.push(log);
    }

    await this.logsRepository.save(logs);

    return { success: true, count: iterations, message: 'Simulation complete' };
  }

  private async checkInside(
    fenceId: string,
    lat: number,
    lon: number,
  ): Promise<boolean> {
    const result: Geofence | null = await this.fenceRepository
      .createQueryBuilder('f')
      .where('f.id = :id', { id: fenceId })
      .andWhere(
        `ST_Contains(f.geometry, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))`,
        { lon, lat },
      )
      .getOne();

    return !!result;
  }

  async exportCsv(): Promise<string> {
    const logs = await this.logsRepository.find();

    let csv =
      'Timestamp;RealLat;RealLon;FakeLat;FakeLon;ErrorMeters;QoSRetained\n';

    logs.forEach((l) => {
      csv += `${l.timestamp.toISOString()};${l.realLat};${l.realLon};${l.perturbedLat};${l.perturbedLon};${l.errorMeters};${l.qosRetained ? 1 : 0}\n`;
    });

    return csv;
  }

  public async wipe(): Promise<void> {
    await this.logsRepository.clear();
  }
}
