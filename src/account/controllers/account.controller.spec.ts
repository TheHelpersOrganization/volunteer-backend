import { Test, TestingModule } from '@nestjs/testing';

import { Role } from '../../auth/constants/role.constant';
import { PaginationParamsDto } from '../../common/dtos/pagination-params.dto';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { AccountOutputDto } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { AccountService } from '../services/account.service';
import { AccountController } from './account.controller';

describe('UserController', () => {
  let controller: AccountController;
  const mockedUserService = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockedLogger = { setContext: jest.fn(), log: jest.fn() };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: mockedUserService },
        { provide: AppLogger, useValue: mockedLogger },
      ],
    }).compile();

    controller = moduleRef.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const ctx = new RequestContext();

  describe('get Users as a list', () => {
    it('Calls getUsers function', () => {
      const query: PaginationParamsDto = {
        offset: 0,
        limit: 0,
      };
      mockedUserService.getUsers.mockResolvedValue({ users: [], count: 0 });
      controller.getAccounts(ctx, query);
      expect(mockedUserService.getUsers).toHaveBeenCalled();
    });
  });

  const currentDate = new Date().toString();

  const expectedOutput: AccountOutputDto = {
    id: 1,
    username: 'default-user',
    name: 'default-name',
    roles: [Role.Volunteer],
    isAccountDisabled: false,
    email: 'e2etester@random.com',
    createdAt: currentDate,
    updatedAt: currentDate,
  };

  describe('Get user by id', () => {
    it('should call service method getUserById with id', async () => {
      const id = 1;
      mockedUserService.getUserById.mockResolvedValue(expectedOutput);

      expect(await controller.getAccount(ctx, id)).toEqual({
        data: expectedOutput,
        meta: {},
      });
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(ctx, id);
    });
  });

  describe('Update user by id', () => {
    it('Update user by id and returns user', async () => {
      const input = new UpdateAccountInput();
      mockedUserService.updateUser.mockResolvedValue(expectedOutput);

      expect(await controller.updateAccount(ctx, 1, input)).toEqual({
        data: expectedOutput,
        meta: {},
      });
    });
  });
});
