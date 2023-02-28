import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Otp } from '../entities';

@Injectable()
export class OtpRepository extends Repository<Otp> {
  constructor(dataSource: DataSource) {
    super(Otp, dataSource.createEntityManager());
  }
}
