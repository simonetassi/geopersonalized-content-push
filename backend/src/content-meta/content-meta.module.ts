import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentMeta } from './entities/content-meta.entity';
import { ContentMetaService } from './content-meta.service';
import { ContentMetaController } from './content-meta.controller';
import { Geofence } from '@/geofences/entities/geofence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentMeta, Geofence])],
  providers: [ContentMetaService],
  controllers: [ContentMetaController],
})
export class ContentMetaModule {}
