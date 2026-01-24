import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PrivacyAnalysisLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  realLat: number;

  @Column({ type: 'float' })
  realLon: number;

  @Column({ type: 'float' })
  perturbedLat: number;

  @Column({ type: 'float' })
  perturbedLon: number;

  @Column({ type: 'float' })
  errorMeters: number;

  @Column()
  isRealInside: boolean;

  @Column()
  isPerturbedInside: boolean;

  @Column()
  qosRetained: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
