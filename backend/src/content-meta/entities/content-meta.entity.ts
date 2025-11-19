import { Geofence } from '@/geofences/entities/geofence.entity';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class ContentMeta {
  @PrimaryColumn('uuid')
  @Generated('uuid')
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
