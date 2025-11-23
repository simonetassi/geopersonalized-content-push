import { Geometry } from 'geojson';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
