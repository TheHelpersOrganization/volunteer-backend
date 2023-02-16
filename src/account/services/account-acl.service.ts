import { Injectable } from '@nestjs/common';

import { ROLE } from '../../auth/constants/role.constant';
import { BaseAclService } from '../../common/acl/acl.service';
import { Action } from '../../common/acl/action.constant';
import { Actor } from '../../common/acl/actor.constant';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountAclService extends BaseAclService<Account> {
  constructor() {
    super();
    // Admin can do all action
    this.canDo(ROLE.ADMIN, [Action.Manage]);
    //user can read himself or any other user
    this.canDo(ROLE.USER, [Action.Read]);
    // user can only update himself
    this.canDo(ROLE.USER, [Action.Update], this.isUserItself);
  }

  isUserItself(resource: Account, actor: Actor): boolean {
    return resource.email === actor.id;
  }
}
