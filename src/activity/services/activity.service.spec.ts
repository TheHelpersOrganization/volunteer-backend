import { Test, TestingModule } from '@nestjs/testing';
import { Skill } from '@prisma/client';
import { RequestContext } from 'src/common/request-context';
import { AppPrismaClient } from 'src/prisma';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;
  const context = new RequestContext();

  let skills: Skill[] = [];

  beforeEach(async () => {
    const prismaClient = new AppPrismaClient();
    await prismaClient.connect();

    await prismaClient.organization.createMany({
      data: [
        {
          name: 'test',
          description: 'test',
        },
        {
          name: 'test2',
          description: 'test2',
        },
      ],
    });

    await prismaClient.skill.createMany({
      data: [
        {
          name: 'test',
          description: 'test',
        },
        {
          name: 'test2',
          description: 'test2',
        },
      ],
    });
    skills = await prismaClient.skill.findMany();

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ActivityService],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create activity', async () => {
    const activity = await service.create(context, {
      name: 'test',
      description: 'test',
      skillIds: skills.map((s) => s.id),
    });
    expect(activity).toBeDefined();
  });
});
