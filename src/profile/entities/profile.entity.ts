import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// typeorm require relative path, otherwise it will throw module not found error
import { Account } from '../../account/entities/account.entity';
import { Gender } from '../constants/profile.constant';

@Entity('profiles')
export class Profile {
  @PrimaryColumn()
  accountId: number;

  @OneToOne(() => Account)
  account: Account;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @CreateDateColumn({ name: 'createdAt', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', nullable: true })
  updatedAt: Date;
}
