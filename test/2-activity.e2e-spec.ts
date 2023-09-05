import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import dayjs from 'dayjs';
import { AccountService } from 'src/account/services';
import { ActivityOutputDto } from 'src/activity/dtos';
import { ModActivityService } from 'src/activity/services';
import { AppModule } from 'src/app.module';
import { AccountTokenOutputDto } from 'src/auth/dtos';
import { RequestContext } from 'src/common/request-context';
import { CreateLocationInputDto } from 'src/location/dtos';
import { OrganizationStatus } from 'src/organization/constants';
import { OrganizationOutputDto } from 'src/organization/dtos';
import { OrganizationService } from 'src/organization/services';
import { PrismaService } from 'src/prisma';
import { RoleService } from 'src/role/services';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftVolunteerOutputDto } from 'src/shift-volunteer/dtos';
import { ShiftStatus } from 'src/shift/constants';
import { ShiftOutputDto } from 'src/shift/dtos';
import { ShiftService } from 'src/shift/services';
import request from 'supertest';
import { logIfError } from './utils';

describe('Activity Controller (e2e)', () => {
  let app: INestApplication;
  let organization: OrganizationOutputDto;
  let activity: ActivityOutputDto;
  let shift: ShiftOutputDto;
  let overlappingShift: ShiftOutputDto;
  let startedShiftId: number;
  let endedShiftId: number;
  let accountToken: AccountTokenOutputDto;
  let modAccountToken: AccountTokenOutputDto;
  let volunteer: ShiftVolunteerOutputDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const prisma = app.get(PrismaService);

    const requestContext = new RequestContext();

    await app.get(RoleService).createDefaultRoles(requestContext);

    const modAccount = await app
      .get(AccountService)
      .createAccount(requestContext, {
        email: 'mod@test.com',
        password: '123456',
        isAccountDisabled: false,
      });

    requestContext.account = modAccount;

    organization = await app.get(OrganizationService).create(requestContext, {
      name: 'Test Organization',
      description: 'Test Organization Description',
      phoneNumber: '0123456789',
      email: 'organization@test.com',
      website: 'https://thehelpers.me',
      locations: [],
      files: [],
      contacts: [],
    });

    await app
      .get(OrganizationService)
      .updateStatus(
        requestContext,
        organization.id,
        OrganizationStatus.Verified,
      );

    activity = await app
      .get(ModActivityService)
      .createActivity(requestContext, organization.id, {
        name: 'Test Activity',
        description: 'Test Activity Description',
        location: {},
        contacts: [],
      });

    shift = await app.get(ShiftService).createShift(requestContext, {
      activityId: activity.id,
      name: 'Test Shift',
      description: 'Test Shift Description',
      startTime: dayjs().toDate(),
      endTime: dayjs().add(3, 'hour').toDate(),
    });

    startedShiftId = (
      await prisma.shift.create({
        data: {
          activityId: activity.id,
          name: 'Test Shift',
          status: ShiftStatus.Ongoing,
          description: 'Test Shift Description',
          startTime: dayjs().subtract(3, 'hour').toDate(),
          endTime: dayjs().add(1, 'hour').toDate(),
        },
      })
    ).id;

    endedShiftId = (
      await prisma.shift.create({
        data: {
          activityId: activity.id,
          name: 'Test Shift',
          status: ShiftStatus.Completed,
          description: 'Test Shift Description',
          startTime: dayjs().subtract(3, 'hour').toDate(),
          endTime: dayjs().subtract(1, 'hour').toDate(),
        },
      })
    ).id;

    const volunteerAccount = await app
      .get(AccountService)
      .createAccount(requestContext, {
        email: 'volunteer@test.com',
        password: '123456',
        isAccountDisabled: false,
      });
  });

  afterAll(async () => {
    const prismaService = app.get(PrismaService);
    await prismaService.deleteAllData();
    await app.close();
  });

  describe('login', () => {
    it('volunteer should login successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'volunteer@test.com',
          password: '123456',
        })
        .expect(HttpStatus.OK);
      accountToken = res.body.data;
    });

    it('moderator should login successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mod@test.com',
          password: '123456',
        })
        .expect(HttpStatus.OK);
      modAccountToken = res.body.data;
    });
  });

  describe('moderator create activity', () => {
    it('should throw if organization does not exist', async () => {
      return request(app.getHttpServer())
        .post('/mod/organizations/0/activities')
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({
          name: 'Test Activity',
          description: 'Test Activity Description',
          location: {},
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should create activity', async () => {
      const res = await request(app.getHttpServer())
        .post(`/mod/organizations/${organization.id}/activities`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({
          name: 'Test Activity',
          description: 'Test Activity Description',
          location: {},
        })
        .expect(HttpStatus.CREATED);
      activity = res.body.data;
    });
  });

  describe('moderator create shift', () => {
    it('should throw if activity does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/shifts')
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({
          name: 'Test Shift',
          activityId: 0,
          description: 'Test Shift Description',
          startTime: dayjs().toDate(),
          endTime: dayjs().add(1, 'minute').toDate(),
          locations: [new CreateLocationInputDto()],
          contacts: [],
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should create shift', async () => {
      const res = await request(app.getHttpServer())
        .post(`/shifts`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({
          name: 'Test Shift',
          activityId: activity.id,
          description: 'Test Shift Description',
          startTime: dayjs().toDate(),
          endTime: dayjs().add(1, 'minute').toDate(),
          locations: [new CreateLocationInputDto()],
          contacts: [],
        })
        .expect(HttpStatus.CREATED);
      shift = res.body.data;
    });

    it('should create another shift', async () => {
      const res = await request(app.getHttpServer())
        .post(`/shifts`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({
          name: 'Test Shift 2',
          activityId: activity.id,
          description: 'Test Shift Description',
          startTime: dayjs().toDate(),
          endTime: dayjs().add(1, 'minute').toDate(),
          locations: [new CreateLocationInputDto()],
          contacts: [],
        })
        .expect(HttpStatus.CREATED);
      overlappingShift = res.body.data;
    });
  });

  describe('volunteer search activities', () => {
    it('should find activities', () => {
      return request(app.getHttpServer())
        .get(`/activities`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.length).toBeGreaterThan(0);
          expect(body.data.map((a) => a.id)).toContainEqual(activity.id);
        });
    });

    it('should find shifts', () => {
      return request(app.getHttpServer())
        .get(`/shifts`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .send({
          activityId: activity.id,
        })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.data.length).toBeGreaterThan(0);
          const shiftIds = body.data.map((a) => a.id);
          expect(shiftIds).toContain(shift.id);
          expect(shiftIds).toContain(overlappingShift.id);
        });
    });
  });

  describe('volunteer register to shift', () => {
    it('should throw if shift does not exist', () => {
      return request(app.getHttpServer())
        .post('/shifts/0/volunteers/join')
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should throw if shift has started', () => {
      return request(app.getHttpServer())
        .post(`/shifts/${startedShiftId}/volunteers/join`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw if shift has ended', () => {
      return request(app.getHttpServer())
        .post(`/shifts/${endedShiftId}/volunteers/join`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should join shift', async () => {
      volunteer = (
        await request(app.getHttpServer())
          .post(`/shifts/${shift.id}/volunteers/join`)
          .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
          .expect(HttpStatus.CREATED)
      ).body.data;
    });
  });

  describe('moderator handle volunteer registration', () => {
    it('should approve volunteer to shift', () => {
      return request(app.getHttpServer())
        .put(`/shifts/${shift.id}/volunteers/${volunteer.id}/approve`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .expect(HttpStatus.OK)
        .expect(
          ({ body }) => body.data.status === ShiftVolunteerStatus.Approved,
        )
        .end(logIfError);
    });

    it('should remove volunteer out of the shift', () => {
      return request(app.getHttpServer())
        .put(`/shifts/${shift.id}/volunteers/${volunteer.id}/remove`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .expect(HttpStatus.OK)
        .expect(
          ({ body }) => body.data.status === ShiftVolunteerStatus.Removed,
        );
    });

    it('volunteer try to join shift again', async () => {
      const res = await request(app.getHttpServer())
        .post(`/shifts/${shift.id}/volunteers/join`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.CREATED);
      volunteer = res.body.data;
    });

    it('should reject volunteer to shift', async () => {
      await request(app.getHttpServer())
        .put(`/shifts/${shift.id}/volunteers/${volunteer.id}/reject`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .send({ rejectionReason: 'Test Reject' })
        .expect(HttpStatus.OK)
        .expect(
          ({ body }) => body.data.status === ShiftVolunteerStatus.Rejected,
        )
        .expect(({ body }) => body.data.rejectionReason === 'Test Reject');
    });
  });

  describe('volunteer join overlapping shift', () => {
    it('should join shift', async () => {
      volunteer = (
        await request(app.getHttpServer())
          .post(`/shifts/${shift.id}/volunteers/join`)
          .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
          .expect(HttpStatus.CREATED)
      ).body.data;
    });

    it('should approve volunteer to shift', () => {
      return request(app.getHttpServer())
        .put(`/shifts/${shift.id}/volunteers/${volunteer.id}/approve`)
        .set('Authorization', `Bearer ${modAccountToken.token.accessToken}`)
        .expect(HttpStatus.OK)
        .expect(
          ({ body }) => body.data.status === ShiftVolunteerStatus.Approved,
        );
    });

    it('should throw overlapping shift', async () => {
      await request(app.getHttpServer())
        .post(`/shifts/${overlappingShift.id}/volunteers/join`)
        .set('Authorization', `Bearer ${accountToken.token.accessToken}`)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => body.message.includes('overlapping'));
    });
  });
});
