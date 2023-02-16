import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
