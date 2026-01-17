import { ContentMeta } from '@/content-meta/entities/content-meta.entity';
import { Geometry } from 'geojson';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Geofence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    srid: 4326,
    spatialFeatureType: 'Geometry',
  })
  geometry: Geometry;

  @Column('jsonb')
  metadata: Record<string, any>;

  @OneToMany(() => ContentMeta, (contentMeta) => contentMeta.fence)
  contents: ContentMeta[];
}
