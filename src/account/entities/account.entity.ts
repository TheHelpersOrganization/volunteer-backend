import { AbstractEntity } from 'src/common/entities/abstract-entity.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EMAIL_MAX_LENGTH } from '../constants/account.constant';

@Entity('accounts')
export class Account extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: EMAIL_MAX_LENGTH, unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  isAccountDisabled: boolean;
}
