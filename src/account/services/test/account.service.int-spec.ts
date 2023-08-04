import { CommonModule } from '@app/common/common.module';
import { PrismaModule } from '@app/prisma';
import { Test } from '@nestjs/testing';
import { AccountService } from '..';

describe('AccountService', () => {
  let service: AccountService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule],
      providers: [AccountService],
    }).compile();

    service = moduleRef.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
