import { Test, TestingModule } from '@nestjs/testing';
import { nanoid } from 'nanoid';
import { ActivityOutputDto, CreateActivityInputDto } from 'src/activity/dtos';
import { Role } from 'src/auth/constants';
import { CommonModule } from 'src/common/common.module';
import { RequestContext } from 'src/common/request-context';
import { AppPrismaClient } from 'src/prisma';
import { ActivityService } from '../activity.service';
import { ModActivityService } from '../mod-activity.service';

const prefix = 'activity';

describe('ActivityService', () => {
  let prisma: AppPrismaClient;
  let activityService: ActivityService;
  let modActivityService: ModActivityService;
  const volunteerContext = new RequestContext();
  const modContext = new RequestContext();
  let accountIds: number[];
  let organizationId = 0;
  let skillIds: number[];
  let activity: ActivityOutputDto;

  beforeAll(async () => {
    prisma = new AppPrismaClient();
    await prisma.connect();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [ActivityService, ModActivityService],
    }).compile();

    const modAccount = await prisma.account.create({
      data: {
        email: `${nanoid()}@example.com`,
        password: '12345678',
        isAccountDisabled: false,
      },
    });
    modContext.account = {
      ...modAccount,
      roles: [Role.Moderator],
    };
    const volunteerAccount = await prisma.account.create({
      data: {
        email: `${nanoid()}@example.com`,
        password: '12345678',
        isAccountDisabled: false,
      },
    });
    volunteerContext.account = { ...volunteerAccount, roles: [Role.Volunteer] };
    accountIds = [modAccount.id, volunteerAccount.id];

    const skill1 = await prisma.skill.create({
      data: {
        name: nanoid(),
        description: 'test',
      },
    });
    const skill2 = await prisma.skill.create({
      data: {
        name: nanoid(),
        description: 'test',
      },
    });
    skillIds = [skill1.id, skill2.id];

    const organization = await prisma.organization.create({
      data: {
        name: nanoid(),
        description: 'test',
        website: 'test',
        email: 'test',
        phoneNumber: 'test',
        ownerId: modAccount.id,
      },
    });
    organizationId = organization.id;

    activityService = moduleRef.get(ActivityService);
    modActivityService = moduleRef.get(ModActivityService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
    expect(modActivityService).toBeDefined();
  });

  describe('create activity', () => {
    it('should create activity successfully', async () => {
      const activityInput: CreateActivityInputDto = {
        name: 'test',
        description: 'test',
        activityManagerIds: accountIds,
      };
      activity = await modActivityService.createActivity(
        modContext,
        organizationId,
        activityInput,
      );
      expect(activity).toBeDefined();
      expect(activity.name).toBe(activityInput.name);
      expect(activity.description).toBe(activityInput.description);
      expect(activity.organizationId).toBe(organizationId);
      expect(activity.activityManagerIds).toHaveLength(2);
    });
  });

  describe('get activities', () => {
    it('should return no shift-empty activities', async () => {
      const activities = await activityService.getAll(modContext, {});
      expect(activities).toEqual([]);
    });
  });
});
