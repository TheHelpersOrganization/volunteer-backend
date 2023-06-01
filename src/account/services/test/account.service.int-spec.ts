import { Test } from '@nestjs/testing';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma';
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
