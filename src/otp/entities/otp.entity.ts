import { Account } from 'src/account/entities';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

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
