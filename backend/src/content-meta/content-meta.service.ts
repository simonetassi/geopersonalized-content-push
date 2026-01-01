import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentMeta } from './entities/content-meta.entity';
import {
  ContentMetaDTO,
  CreateContentMetaDTO,
  UpdateContentMetaDTO,
} from './dtos';
import { Geofence } from '@/geofences/entities/geofence.entity';

@Injectable()
export class ContentMetaService {
  public constructor(
    @InjectRepository(ContentMeta)
    private readonly contentMetaRepository: Repository<ContentMeta>,
    @InjectRepository(Geofence)
    private readonly geofenceRepository: Repository<Geofence>,
  ) {}

  public async create(
    createContentMetaDto: CreateContentMetaDTO,
  ): Promise<ContentMetaDTO> {
    const fence = await this.geofenceRepository.findOneBy({
      id: createContentMetaDto.fenceId,
    });

    if (fence === null) {
      throw new NotFoundException(
        `Geofence with ID ${createContentMetaDto.fenceId} not found`,
      );
    }

    return this.contentMetaRepository.save({ ...createContentMetaDto, fence });
  }

  public findAll(): Promise<ContentMeta[]> {
    return this.contentMetaRepository.find();
  }

  public findOne(id: string): Promise<ContentMeta | null> {
    return this.contentMetaRepository.findOne({
      where: { id },
      relations: ['fence'],
    });
  }

  public async getRepoUrl(id: string): Promise<string | null> {
    const url = (
      await this.contentMetaRepository.findOne({
        where: { id },
        select: { id: true, repoUrl: true },
      })
    ).repoUrl;

    if (!url)
      throw new NotFoundException(`ContentMeta with ID ${id} not found`);

    return url;
  }

  public async findByCoords(
    latitude: number,
    longitude: number,
  ): Promise<ContentMeta[] | null> {
    const foundFence = await this.geofenceRepository
      .createQueryBuilder('fence')
      .where(
        'ST_Covers(fence.geometry, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))',
        {
          longitude,
          latitude,
        },
      )
      .getOne();

    if (foundFence === null) {
      throw new NotFoundException(`No fence found for given coordinates`);
    }

    return this.contentMetaRepository.find({
      where: { fence: { id: foundFence.id } },
      relations: ['fence'],
    });
  }

  async update(
    id: string,
    updateContentMetaDto: UpdateContentMetaDTO,
  ): Promise<ContentMeta> {
    const result = await this.contentMetaRepository.update(
      id,
      updateContentMetaDto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`ContentMeta with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  public async delete(id: string): Promise<void> {
    await this.contentMetaRepository.delete(id);
  }
}
