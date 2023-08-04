import { BaseApiException } from '@app/common/exceptions';

export class RoleNotFountException extends BaseApiException {
  constructor() {
    super('Role not found', undefined, 404);
  }
}
