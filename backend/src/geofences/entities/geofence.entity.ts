import { Geometry } from 'geojson';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Geofence {
  @PrimaryColumn('uuid')
  @Generated('uuid')
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
