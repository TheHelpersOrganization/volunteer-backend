import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Organization } from '../entities';

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
  constructor(private dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }
}
