import { Test } from "@nestjs/testing";

describe('AuthController Integration', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, AppLogger],
    }).compile();
  });

  it.todo('should register new user');
});
