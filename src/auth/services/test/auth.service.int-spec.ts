import { Test } from "@nestjs/testing";
import { AppLogger } from "src/common/logger";
import { AuthService } from "../auth.service";

describe('AuthService Integration', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, AppLogger],
    }).compile();
  });

  it.todo('should register new user');
});