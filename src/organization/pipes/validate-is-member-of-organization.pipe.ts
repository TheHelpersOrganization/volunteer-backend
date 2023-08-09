import {
  APP_REQUEST_CONTEXT,
  RequestContext,
} from '@app/common/request-context';
import { PrismaService } from '@app/prisma';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { OrganizationNotFoundException } from '../exceptions';

@Injectable({
  scope: Scope.REQUEST,
})
export class ValidateIsMemberOfOrganizationPipe implements PipeTransform {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(APP_REQUEST_CONTEXT) private readonly context: RequestContext,
  ) {}

  transform(id: number, metadata: ArgumentMetadata) {
    console.log('context', this.context);
    throw new OrganizationNotFoundException();
  }
}
