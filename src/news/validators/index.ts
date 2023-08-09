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
export class IsOrganizationMemberValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    return (await this.prisma.file.count({ where: { id: value } })) == 1;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid file`;
  }
}

export function IsFileId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsOrganizationMemberValidator,
    });
  };
}
