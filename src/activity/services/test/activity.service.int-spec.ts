import { Test, TestingModule } from '@nestjs/testing';
import { nanoid } from 'nanoid';
import { AccountModule } from 'src/account/account.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/services';
import { CommonModule } from 'src/common/common.module';
import { RequestContext } from 'src/common/request-context';
import { FileSizeUnit } from 'src/file/constants';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/services';
import { OrganizationModule } from 'src/organization/organization.module';
import { OrganizationService } from 'src/organization/services';
import { SkillService } from 'src/skill/services';
import { SkillModule } from 'src/skill/skill.module';
import { ActivityService } from '../activity.service';

describe('ActivityService', () => {
  let activityService: ActivityService;
  const volunteerContext = new RequestContext();
  const modContext = new RequestContext();
  let accountIds: number[];
  let organizationId = 0;
  let skillIds: number[];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        SkillModule,
        AuthModule,
        OrganizationModule,
        FileModule,
        AccountModule,
      ],
      providers: [ActivityService],
    }).compile();

    const authService = moduleRef.get(AuthService);
    const organizationService = moduleRef.get(OrganizationService);
    const fileService = moduleRef.get(FileService);
    const skillService = moduleRef.get(SkillService);

    const account = await authService.register(volunteerContext, {
      email: 'activity-volunteer-test@example.com',
      password: 'activity-volunteer-test@example.com',
      isAccountDisabled: false,
    });
    const modAccount = await authService.register(volunteerContext, {
      email: 'activity-mod-test@example.com',
      password: 'activity-mod-test@example.com',
      isAccountDisabled: false,
    });
    accountIds = [account.id, modAccount.id];
    volunteerContext.account = account;
    modContext.account = modAccount;

    skillIds = (
      await Promise.all([
        skillService.create(volunteerContext, {
          name: 'test',
          description: 'test',
        }),
        skillService.create(volunteerContext, {
          name: 'test2',
          description: 'test2',
        }),
      ])
    ).map((s) => s.id);

    const logo = await fileService.createFile(volunteerContext, {
      name: 'test',
      mimetype: 'image/png',
      size: 1,
      sizeUnit: FileSizeUnit.MB,
      path: '/',
      internalName: nanoid(),
      createdBy: account.id,
    });
    const organization = await organizationService.create(modContext, {
      name: 'test',
      description: 'test',
      email: 'activity-mod-test@example.com',
      phoneNumber: '1234567890',
      website: 'https://example.com',
      logo: logo.id,
      banner: undefined,
      locations: [],
      files: [],
      contacts: [],
    });
    organizationId = organization.id;

    activityService = moduleRef.get(ActivityService);
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });
});
