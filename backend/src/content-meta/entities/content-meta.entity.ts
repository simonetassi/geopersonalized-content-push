import { Geofence } from '@/geofences/entities/geofence.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentType } from '../dtos';

@Entity()
export class ContentMeta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fenceId' })
  fenceId: string;

  @ManyToOne(() => Geofence, (geofence) => geofence.contents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fenceId' })
  fence: Geofence;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.TEXT,
  })
  type: ContentType;

  @Column()
  descriptor: string;

  @Column()
  repoUrl: string;
}
