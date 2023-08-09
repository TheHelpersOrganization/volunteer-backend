import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsOrganizationMember', async: true })
@Injectable()
export class IsOrganizationIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const count = await this.prisma.organization.count({
      where: { id: value },
    });
    return count == 1;
  }

  defaultMessage(args: ValidationArguments) {
    return `Organization with id ${args.value} does not exist`;
  }
}

export function IsOrganizationId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsOrganizationIdValidator,
    });
  };
}
