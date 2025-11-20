import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { UserRole } from '../common/user-role';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
