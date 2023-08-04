import { ActivityOutputDto, CreateActivityInputDto } from '@app/activity/dtos';
import { CommonModule } from '@app/common/common.module';
import { RequestContext } from '@app/common/request-context';
import { AppPrismaClient } from '@app/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, Organization } from '@prisma/client';
import { seedAccountsAndRoles } from 'prisma/seed/seed-account-role';
import { ModActivityService } from '..';

describe('ModActivityService', () => {
  let modActivityService: ModActivityService;
  const modContext = new RequestContext();
  let modAccounts: Account[];
  let volunteerAccounts: Account[];
  let organization: Organization;
  let activity: ActivityOutputDto;

  beforeAll(async () => {
    const prismaClient = new AppPrismaClient();
    await prismaClient.connect();
    await prismaClient.deleteAllData();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [ModActivityService],
    }).compile();

    const res = await seedAccountsAndRoles(prismaClient, {
      numberOfOpAccounts: 0,
      numberOfAdminAccounts: 1,
      numberOfVolunteerAccounts: 5,
      numberOfModAccounts: 2,
    });
    modAccounts = res.modAccounts;
    volunteerAccounts = res.volunteerAccounts;

    organization = await prismaClient.organization.create({
      data: {
        name: 'test',
        description: 'test',
        ownerId: modAccounts[0].id,
      },
    });

    modActivityService = moduleRef.get(ModActivityService);

    await prismaClient.$disconnect();
  });

  describe('create activity', () => {
    it('should create activity successfully', async () => {
      const activityInput: CreateActivityInputDto = {
        name: 'test',
        description: 'test',
        activityManagerIds: volunteerAccounts.map((account) => account.id),
      };
      activity = await modActivityService.createActivity(
        modContext,
        organization.id,
        activityInput,
      );
      expect(activity).toBeDefined();
      expect(activity.name).toBe(activityInput.name);
      expect(activity.description).toBe(activityInput.description);
      expect(activity.organizationId).toBe(organization.id);
      expect(activity.activityManagerIds).toHaveLength(
        volunteerAccounts.length,
      );
    });
  });
});
