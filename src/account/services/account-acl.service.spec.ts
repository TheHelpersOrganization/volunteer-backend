import { Test, TestingModule } from '@nestjs/testing';

import { ROLE } from '../../auth/constants/role.constant';
import { Action } from '../../common/acl/action.constant';
import { AccountAclService } from './account-acl.service';

describe(AccountAclService.name, () => {
  let service: AccountAclService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountAclService],
    }).compile();

    service = module.get<AccountAclService>(AccountAclService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('for admin user', () => {
    let accountAcl;
    beforeEach(async () => {
      const user = {
        id: 6,
        username: 'admin',
        roles: [ROLE.ADMIN],
      };
      accountAcl = service.forActor(user);
    });

    it('should allow admin user to create, read, update, delete, list user', async () => {
      expect(accountAcl.canDoAction(Action.Create)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.Read)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.Update)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.Delete)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.List)).toBeTruthy();
    });

    it('should allow admin to read, update, delete any user', () => {
      const otherUser = {
        id: 7,
      };
      expect(accountAcl.canDoAction(Action.Read, otherUser)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.Update, otherUser)).toBeTruthy();
      expect(accountAcl.canDoAction(Action.Delete, otherUser)).toBeTruthy();
    });
  });

  describe('for user role', () => {
    let user;
    let userAcl;

    beforeEach(async () => {
      user = {
        id: 11,
        username: 'jeo',
        roles: [ROLE.USER],
      };
      userAcl = service.forActor(user);
    });

    it('should allow user to read, update himself', async () => {
      expect(userAcl.canDoAction(Action.Read, user)).toBeTruthy();
      expect(userAcl.canDoAction(Action.Update, user)).toBeTruthy();
    });

    it('should not allow user to delete himself', async () => {
      expect(userAcl.canDoAction(Action.Delete, user)).toBeFalsy();
    });

    it('should allow user to read other user', () => {
      const otherUser = {
        id: 7,
      };
      expect(userAcl.canDoAction(Action.Read, otherUser)).toBeTruthy();
    });

    it('should not allow user to update, delete other user', () => {
      const otherUser = {
        id: 7,
      };
      expect(userAcl.canDoAction(Action.Update, otherUser)).toBeFalsy();
      expect(userAcl.canDoAction(Action.Delete, otherUser)).toBeFalsy();
    });
  });
});
