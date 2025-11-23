import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeofenceModule } from '@/geofences/geofence.module';
import { UsersModule } from '@/users/users.module';
import { Event } from './entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), GeofenceModule, UsersModule],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
