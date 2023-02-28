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
  otp: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
