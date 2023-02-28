import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EMAIL_MAX_LENGTH } from '../constants/account.constant';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: EMAIL_MAX_LENGTH, unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  isAccountDisabled: boolean;

  @Column()
  isAccountVerified: boolean;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
