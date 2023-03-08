import { EMAIL_MAX_LENGTH } from 'src/account/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: EMAIL_MAX_LENGTH, unique: true })
  email: string;

  @Column()
  description: string;

  @Column()
  website: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
