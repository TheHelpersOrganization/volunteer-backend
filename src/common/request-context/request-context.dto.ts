import { Role } from '@app/auth/constants';
import { AccountAccessTokenClaims } from '../../auth/dtos/auth-token-output.dto';

export class RequestContext {
  public requestId: string;

  public url: string;

  public ip: string;

  public account: AccountAccessTokenClaims;

  get isVolunteer() {
    return this.account.roles.includes(Role.Volunteer);
  }

  get isModerator() {
    return this.account.roles.includes(Role.Moderator);
  }

  get isAdmin() {
    return this.account.roles.includes(Role.Admin);
  }
}
