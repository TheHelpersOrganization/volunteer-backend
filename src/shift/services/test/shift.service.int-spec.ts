import { ActivityModule } from '@app/activity/activity.module';
import { ActivityService, ModActivityService } from '@app/activity/services';
import { Role } from '@app/auth/constants';
import { CommonModule } from '@app/common/common.module';
import { RequestContext } from '@app/common/request-context';
import { ContactModule } from '@app/contact/contact.module';
import { LocationModule } from '@app/location/location.module';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { OrganizationModule } from '@app/organization/organization.module';
import { OrganizationService } from '@app/organization/services';
import { AppPrismaClient } from '@app/prisma';
import { ShiftSkillModule } from '@app/shift-skill/shift-skill.module';
import { ShiftOutputDto } from '@app/shift/dtos';
import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '@prisma/client';
import dayjs from 'dayjs';
import { seedAccountsAndRoles } from 'prisma/seed/seed-account-role';
import { ShiftService } from '../shift.service';

describe('ShiftService Integration', () => {
  let shiftService: ShiftService;
  let activityService: ActivityService;
  let modActivityService: ModActivityService;
  let organizationService: OrganizationService;
  let modAccounts: Account[];
  let modContext: RequestContext;
  let organization: OrganizationOutputDto;
  let activityId: number;
  let shiftId: number;
  let shiftId2: number;

  beforeAll(async () => {
    const prisma = new AppPrismaClient();
    await prisma.connect();
    await prisma.deleteAllData();
    await prisma.$disconnect();

    const res = await seedAccountsAndRoles(prisma, {
      numberOfOpAccounts: 0,
      numberOfAdminAccounts: 0,
      numberOfVolunteerAccounts: 0,
      numberOfModAccounts: 1,
    });
    modAccounts = res.modAccounts;
    modContext = new RequestContext();
    modContext.account = {
      id: modAccounts[0].id,
      email: modAccounts[0].email,
      roles: [Role.Moderator],
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        LocationModule,
        ContactModule,
        ShiftSkillModule,
        ActivityModule,
        OrganizationModule,
      ],
      providers: [ShiftService],
    }).compile();

    shiftService = module.get(ShiftService);
    activityService = module.get(ActivityService);
    modActivityService = module.get(ModActivityService);
    organizationService = module.get(OrganizationService);
  });

  it('should be defined', () => {
    expect(shiftService).toBeDefined();
    expect(activityService).toBeDefined();
    expect(modActivityService).toBeDefined();
    expect(organizationService).toBeDefined();
  });

  it('should create organization successfully', async () => {
    organization = await organizationService.create(modContext, {
      name: 'test',
      description: 'test',
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      locations: [],
      contacts: [],
      files: [],
    });
    expect(organization).toBeDefined();
  });

  it('should create activity successfully', async () => {
    const activity = await modActivityService.createActivity(
      modContext,
      organization.id,
      {
        name: 'test',
        description: 'test',
      },
    );
    activityId = activity.id;
    expect(activity).toBeDefined();
  });

  describe('create shift', () => {
    let shift: ShiftOutputDto;

    it('should create shift successfully', async () => {
      shift = await shiftService.createShift(modContext, {
        activityId: activityId,
        name: 'test',
        description: 'test',
        startTime: new Date(),
        endTime: new Date(),
      });
      shiftId = shift.id;

      expect(shift).toBeDefined();
      expect(shift.activityId).toBe(activityId);
      expect(shift.name).toBe('test');
      expect(shift.description).toBe('test');
    });

    it('should update activity start/end time', async () => {
      const activity = await activityService.getById(
        modContext,
        activityId,
        {},
      );

      expect(activity?.startTime).toStrictEqual(shift.startTime);
      expect(activity?.endTime).toStrictEqual(shift.endTime);
    });

    let shift2: ShiftOutputDto;
    const startTime2 = dayjs().subtract(3, 'day').toDate();
    it('should create shift successfully 2', async () => {
      shift2 = await shiftService.createShift(modContext, {
        activityId: activityId,
        name: 'test',
        description: 'test',
        startTime: startTime2,
        endTime: dayjs(startTime2).add(1, 'day').toDate(),
      });
      shiftId2 = shift2.id;

      expect(shift2).toBeDefined();
      expect(shift2.activityId).toBe(activityId);
      expect(shift2.name).toBe('test');
      expect(shift2.description).toBe('test');
    });

    it('should update activity start/end time', async () => {
      const activity = await activityService.getById(
        modContext,
        activityId,
        {},
      );

      expect(activity?.startTime).toStrictEqual(shift2.startTime);
      expect(activity?.endTime).toStrictEqual(shift.endTime);
    });
  });

  describe('update shift', () => {
    let shift: ShiftOutputDto;
    const updatedStartTime = dayjs().subtract(5, 'day').toDate();
    const updatedEndTime = dayjs().add(10, 'day').toDate();

    it('should update shift successfully', async () => {
      shift = await shiftService.updateShift(
        modContext,
        shiftId,
        {
          name: 'test2',
          description: 'test2',
          startTime: updatedStartTime,
          endTime: updatedEndTime,
        },
        {},
      );

      expect(shift).toBeDefined();
      expect(shift.activityId).toBe(activityId);
      expect(shift.name).toBe('test2');
      expect(shift.description).toBe('test2');
      expect(shift.startTime).toStrictEqual(updatedStartTime);
      expect(shift.endTime).toStrictEqual(updatedEndTime);
    });

    it('should update activity start/end time', async () => {
      const activity = await activityService.getById(
        modContext,
        activityId,
        {},
      );

      expect(activity?.startTime).toStrictEqual(updatedStartTime);
      expect(activity?.endTime).toStrictEqual(updatedEndTime);
    });
  });

  describe('delete shift', () => {
    let shift: ShiftOutputDto | null;
    let shift2: ShiftOutputDto | null;

    it('should delete shift successfully', async () => {
      shift = await shiftService.deleteShift(modContext, shiftId);
      shift2 = await shiftService.deleteShift(modContext, shiftId2);

      expect(shift).toBeDefined();
      expect(shift?.id).toBe(shiftId);
      expect(shift?.activityId).toBe(activityId);
    });

    it('should update activity start/end time', async () => {
      const activity = await activityService.getById(
        modContext,
        activityId,
        {},
      );

      expect(activity).toBeDefined();
      expect(activity?.startTime).toBeNull();
      expect(activity?.endTime).toBeNull();
    });
  });
});
