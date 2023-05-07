import { Test, TestingModule } from '@nestjs/testing';

import { AppLogger } from '../../common/logger/logger.service';
import { AccountService } from '../services/account.service';
import { AccountController } from './account.controller';

describe('AccountController', () => {
  let accountController: AccountController = null;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getMyAccount: jest.fn(),
            getAccount: jest.fn(),
            getAccounts: jest.fn(),
            updateAccount: jest.fn(),
            updateAccountRoles: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    accountController = moduleRef.get<AccountController>(AccountController);
  });
});
