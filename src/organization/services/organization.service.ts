import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';

import { CreateOrganizationInputDto } from '../dto';
import { OrganizationRepository } from '../repositories';

@Injectable()
export class OrganizationService extends AbstractService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    readonly logger: AppLogger,
  ) {
    super(logger);
  }
}
