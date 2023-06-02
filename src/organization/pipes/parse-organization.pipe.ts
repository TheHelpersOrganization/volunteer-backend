import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { OrganizationNotFoundException } from '../exceptions';

@Injectable()
export class OrganizationValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  transform(id: number, metadata: ArgumentMetadata) {
    const organization = this.prisma.organization.findUnique({
      where: { id },
    });
    if (!organization) {
      throw new OrganizationNotFoundException();
    }
    return id;
  }
}
