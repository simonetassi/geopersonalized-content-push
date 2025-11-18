import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Geofence } from './entities/geofence.entity';
import { CreateGeofenceDTO } from './dtos/create-geofence.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GeofenceService {
  public constructor(
    @InjectRepository(Geofence)
    private readonly geofenceRepository: Repository<Geofence>,
  ) {}

  public async create(createGeofenceDto: CreateGeofenceDTO): Promise<Geofence> {
    return this.geofenceRepository.save(createGeofenceDto);
  }

  public findAll(): Promise<Geofence[]> {
    return this.geofenceRepository.find();
  }

  public findOne(id: string): Promise<Geofence | null> {
    return this.geofenceRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateGeofenceDto: Partial<CreateGeofenceDTO>,
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
