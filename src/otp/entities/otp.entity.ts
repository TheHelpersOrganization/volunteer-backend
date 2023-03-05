import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Account } from '../../account/entities';
import { OtpType } from '../constants';

@Entity()
export class Otp {
  @PrimaryColumn()
  accountId: number;

  @OneToOne(() => Account)
  account: Account;

  @PrimaryColumn()
  type: OtpType;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
