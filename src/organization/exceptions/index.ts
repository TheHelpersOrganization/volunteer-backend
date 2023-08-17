import { BaseApiException } from '@app/common/exceptions';
import { HttpStatus } from '@nestjs/common';

export class InvalidOrganizationStatusException extends BaseApiException {
  constructor() {
    super({ message: 'Invalid organization status' });
  }
}

export class OrganizationNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Organization not found', status: HttpStatus.NOT_FOUND });
  }
}

export class OrganizationIsNotVerifiedException extends BaseApiException {
  constructor() {
    super({ message: 'Organization is not verified' });
  }
}

export class InvalidOrganization extends BaseApiException {
  constructor() {
    super({ message: 'Invalid organization' });
  }
}

export class UserHaveAlreadyJoinedOrganizationException extends BaseApiException {
  constructor() {
    super({
      message:
        'You have already joined or have pending registration to this organization',
    });
  }
}

export class UserHaveNotJoinedOrganizationException extends BaseApiException {
  constructor() {
    super({
      message:
        'You have not joined or not had pending registration to this organization',
    });
  }
}

export class UserRegistrationStatusNotPendingException extends BaseApiException {
  constructor() {
    super({ message: 'User have finished registration' });
  }
}

export class UserStatusNotApprovedException extends BaseApiException {
  constructor() {
    super({ message: 'User have not finished registration' });
  }
}

export class CannotTransferOwnershipToSelfException extends BaseApiException {
  constructor() {
    super({ message: 'Cannot transfer ownership to yourself' });
  }
}
