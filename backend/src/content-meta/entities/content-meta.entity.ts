import { Geofence } from '@/geofences/entities/geofence.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ContentMeta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Geofence)
  @JoinColumn({ name: 'fenceId' })
  fence: Geofence;

  @Column()
  type: string;

  @Column()
  descriptor: string;

  @Column()
  repoUrl: string;
}
