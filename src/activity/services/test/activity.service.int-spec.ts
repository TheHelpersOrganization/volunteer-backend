import { Test, TestingModule } from '@nestjs/testing';
import { Activity, Organization } from '@prisma/client';
import { nanoid } from 'nanoid';
import { Role } from 'src/auth/constants';
import { CommonModule } from 'src/common/common.module';
import { RequestContext } from 'src/common/request-context';
import { AppPrismaClient } from 'src/prisma';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftService } from 'src/shift/services';
import { ActivityService } from '../activity.service';

describe('ActivityService', () => {
  let prisma: AppPrismaClient;
  let activityService: ActivityService;
  let shiftService: ShiftService;
  const volunteerContext = new RequestContext();
  const modContext = new RequestContext();
  let accountIds: number[];
  let organizationId = 0;
  let skillIds: number[];
  let organization: Organization;
  let emptyShiftActivity: Activity;
  let pendingActivity: Activity;
  let joinApprovedActivity: Activity;
  let completedActivity: Activity;
  let cancelledActivity: Activity;

  beforeAll(async () => {
    prisma = new AppPrismaClient();
    await prisma.connect();
    await prisma.deleteAllData();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [ActivityService],
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

    organization = await prisma.organization.create({
      data: {
        name: nanoid(),
        ownerId: modAccount.id,
      },
    });
    organizationId = organization.id;

    emptyShiftActivity = await prisma.activity.create({
      data: {
        name: nanoid(),
        organizationId: organization.id,
      },
    });

    pendingActivity = await prisma.activity.create({
      data: {
        name: nanoid(),
        organizationId: organization.id,
        description: 'test',
      },
    });

    joinApprovedActivity = await prisma.activity.create({
      data: {
        name: nanoid(),
        organizationId: organization.id,
        description: 'test',
      },
    });

    await prisma.shift.create({
      data: {
        name: nanoid(),
        description: 'test',
        startTime: new Date(),
        endTime: new Date(),
        numberOfParticipants: 10,
        activityId: pendingActivity.id,
        shiftVolunteers: {
          createMany: {
            data: [
              {
                accountId: volunteerAccount.id,
                status: ShiftVolunteerStatus.Pending,
              },
            ],
          },
        },
      },
    });

    await prisma.shift.create({
      data: {
        name: nanoid(),
        description: 'test',
        startTime: new Date(),
        endTime: new Date(),
        numberOfParticipants: 10,
        activityId: joinApprovedActivity.id,
        shiftVolunteers: {
          createMany: {
            data: [
              {
                accountId: volunteerAccount.id,
                status: ShiftVolunteerStatus.Approved,
              },
            ],
          },
        },
      },
    });

    activityService = moduleRef.get(ActivityService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });

  describe('get activities', () => {
    it('should return no shift-empty activities', async () => {
      const activities = await activityService.getAll(volunteerContext, {});
      expect(activities).toHaveLength(2);
      expect(activities?.[0]).toMatchObject({
        id: pendingActivity.id,
        name: pendingActivity.name,
        description: pendingActivity.description,
        organizationId: pendingActivity.organizationId,
      });
    });

    it('should return joined and approved activities', async () => {
      const activities = await activityService.getAll(volunteerContext, {
        joinStatus: [ShiftVolunteerStatus.Approved],
      });
      expect(activities).toHaveLength(1);
      expect(activities?.[0]).toMatchObject({
        id: joinApprovedActivity.id,
        name: joinApprovedActivity.name,
        description: joinApprovedActivity.description,
        organizationId: joinApprovedActivity.organizationId,
      });
    });
  });
});
