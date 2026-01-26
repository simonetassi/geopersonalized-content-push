import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Event } from '@/events/entities/event.entity';
import { Geofence } from '@/geofences/entities/geofence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Geofence])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
