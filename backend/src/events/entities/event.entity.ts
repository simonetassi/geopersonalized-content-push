import { Geofence } from '@/geofences/entities/geofence.entity';
import { User } from '@/users/entities/user.entity';
import { Point } from 'geojson';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventType } from '../common/event-type';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @ManyToOne(() => Geofence, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'fenceId' })
  fence: Geofence;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'Point',
  })
  location: Point;

  @Index()
  @Column({ type: 'timestamptz' })
  timestamp: Date;
}
