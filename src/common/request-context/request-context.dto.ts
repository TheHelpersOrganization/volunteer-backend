import { AccountAccessTokenClaims } from '../../auth/dtos/auth-token-output.dto';

export class RequestContext {
  public requestID: string;

  public url: string;

  public ip: string;

  public account: AccountAccessTokenClaims;
}
