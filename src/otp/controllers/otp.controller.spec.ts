import { Test, TestingModule } from '@nestjs/testing';

import { OtpService } from '../services/otp.service';
import { OtpController } from './otp.controller';

describe('OtpController', () => {
  let controller: OtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [OtpService],
    }).compile();

    controller = module.get<OtpController>(OtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
