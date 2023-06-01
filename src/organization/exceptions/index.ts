import { HttpStatus } from '@nestjs/common';
import { BaseApiException } from 'src/common/exceptions';

export class InvalidOrganizationStatusException extends BaseApiException {
  constructor() {
    super('Invalid organization status');
  }
}

export class OrganizationNotFoundException extends BaseApiException {
  constructor() {
    super('Organization not found', undefined, HttpStatus.NOT_FOUND);
  }
}

export class InvalidOrganization extends BaseApiException {
  constructor() {
    super('Invalid organization');
  }
}

export class UserHaveAlreadyJoinedOrganizationException extends BaseApiException {
  constructor() {
    super(
      'You have already joined or have pending registration to this organization',
    );
  }
}

export class UserHaveNotJoinedOrganizationException extends BaseApiException {
  constructor() {
    super(
      'You have not joined or not had pending registration to this organization',
    );
  }
}

export class UserRegistrationStatusNotPendingException extends BaseApiException {
  constructor() {
    super('User have finished registration');
  }
}

export class UserStatusNotApprovedException extends BaseApiException {
  constructor() {
    super('User have not finished registration');
  }
}
