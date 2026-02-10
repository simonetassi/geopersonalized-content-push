import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Geofence } from './entities/geofence.entity';
import { CreateGeofenceDTO } from './dtos/create-geofence.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateGeofenceDTO } from './dtos';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface EdgeMetadata {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  created_at: number;
  ttl: number;
  expires_at: number;
  is_expired: boolean;
}

@Injectable()
export class GeofenceService {
  public constructor(
    @InjectRepository(Geofence)
    private readonly geofenceRepository: Repository<Geofence>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async create(createGeofenceDto: CreateGeofenceDTO): Promise<Geofence> {
    return this.geofenceRepository.save(createGeofenceDto);
  }

  public findAll(): Promise<Geofence[]> {
    return this.geofenceRepository.find({ relations: ['contents'] });
  }

  public async findAllActive(): Promise<Geofence[]> {
    const fences = await this.geofenceRepository.find({
      relations: ['contents'],
    });
    const activeFences: Geofence[] = [];
    const internalPrefix = this.configService.get<string>(
      'INTERNAL_REPO_PREFIX',
    );

    for (const fence of fences) {
      if (fence.contents?.length > 0) {
        const metaChecks = fence.contents.map(async (content) => {
          try {
            let checkUrl = `${content.repoUrl}/meta`;

            // works both locally and on k8s cluster
            if (internalPrefix) {
              checkUrl =
                content.repoUrl.replace(
                  /^http:\/\/geo-jazz\.local\/repos\//,
                  internalPrefix,
                ) + '/meta';
            }

            const response = await lastValueFrom(
              this.httpService.get<EdgeMetadata>(checkUrl),
            );
            if (response.data.is_expired === false) return content;
          } catch (e) {
            console.error(
              `Check failed for ${content.id}.`,
              (e as Error).message,
            );
            return null;
          }
          return null;
        });

        const results = await Promise.all(metaChecks);
        const validContents = results.filter((c) => c !== null);
        if (validContents.length > 0) {
          fence.contents = validContents;
          activeFences.push(fence);
        }
      }
    }
    return activeFences;
  }

  public findOne(id: string): Promise<Geofence | null> {
    return this.geofenceRepository.findOne({
      where: { id },
      relations: ['contents'],
    });
  }

  async update(
    id: string,
    updateGeofenceDto: UpdateGeofenceDTO,
  ): Promise<Geofence> {
    const result = await this.geofenceRepository.update(id, updateGeofenceDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Geofence with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  public async delete(id: string): Promise<void> {
    await this.geofenceRepository.delete(id);
  }
}
