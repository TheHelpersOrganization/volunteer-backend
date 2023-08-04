import { BaseApiException } from '@app/common/exceptions';

export class ReportNotFoundException extends BaseApiException {
  constructor() {
    super('Report not found', undefined, 404);
  }
}

export class ReportAccountMustNotBeNullException extends BaseApiException {
  constructor() {
    super('Report account must not be null', undefined, 400);
  }
}

export class ReportOrganizationMustNotBeNullException extends BaseApiException {
  constructor() {
    super('Report organization must not be null', undefined, 400);
  }
}

export class ReportActivityMustNotBeNullException extends BaseApiException {
  constructor() {
    super('Report activity must not be null', undefined, 400);
  }
}

export class ReportCanNotBeCancelledException extends BaseApiException {
  constructor() {
    super('Report can not be cancelled', undefined, 400);
  }
}

export class ReportIsNotInReviewingException extends BaseApiException {
  constructor() {
    super('Report is not in reviewing', undefined, 400);
  }
}

export class ReportIsInReviewingException extends BaseApiException {
  constructor() {
    super('Report is in reviewing', undefined, 400);
  }
}
