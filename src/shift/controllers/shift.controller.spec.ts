import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from '../services';

import { ActivityShiftController } from './activity-shift.controller';

describe('ShiftController', () => {
  let controller: ActivityShiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityShiftController],
      providers: [ShiftService],
    }).compile();

    controller = module.get<ActivityShiftController>(ActivityShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
