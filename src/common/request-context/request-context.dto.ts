import { AccountAccessTokenClaims } from '../../auth/dtos/auth-token-output.dto';

export class RequestContext {
  public requestId: string;

  public url: string;

  public ip: string;

  public account: AccountAccessTokenClaims;
}

export class IdentifiedRequestContext extends RequestContext {
  public override account: AccountAccessTokenClaims;
}
