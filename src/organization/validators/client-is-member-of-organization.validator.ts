import { RequestContext } from '@app/common/request-context';
import { requireNonNull } from '@app/common/utils';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { OrganizationMemberService } from '../services';

@ValidatorConstraint({ name: 'IsOrganizationMember', async: true })
@Injectable()
export class ClientIsMemberOfOrganizationValidator
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const context: RequestContext = requireNonNull(args.object['context']);
    console.log('context', context);
    return this.organizationMemberService.checkApprovedMember(
      value,
      context.account.id,
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `User is not a member of this organization`;
  }
}

export function ClientIsMemberOfOrganization(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ClientIsMemberOfOrganizationValidator,
    });
  };
}
