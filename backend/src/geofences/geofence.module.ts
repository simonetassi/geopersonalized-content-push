import { Module } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Geofence } from './entities/geofence.entity';
import { GeofenceController } from './geofence.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Geofence])],
  providers: [GeofenceService],
  controllers: [GeofenceController],
  exports: [GeofenceService],
})
export class GeofenceModule {}
