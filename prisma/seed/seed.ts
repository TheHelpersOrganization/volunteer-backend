import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import { AppPrismaClient } from 'src/prisma';
import { seedAccountsAndRoles } from './seed-account-role';
import { seedActivities } from './seed-activity';
import { seedChats } from './seed-chat';
import { seedContacts } from './seed-contacts';
import { seedNotifications } from './seed-notification';
import { seedOrganizations } from './seed-organization';
import { seedProfiles } from './seed-profile';
import { seedProfileSkills } from './seed-profile-skill';
import { seedReports } from './seed-report';
import { seedSkills } from './seed-skill';
import { SkillType } from './utils';

fakerEn.seed(1);
fakerVi.seed(1);

const prisma = new AppPrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  const start = Date.now();
  await prisma.connect();
  await seed();
  console.log(`✅ Seeding finished. Took ${(Date.now() - start) / 1000}s`);
}

const seed = async () => {
  const runWithoutDb = process.argv.includes('--run-without-db');
  if (runWithoutDb) console.log(`+ Run without db: ${runWithoutDb}`);

  const {
    accounts,
    adminAccounts,
    modAccounts,
    volunteerAccounts,
    defaultAccounts,
    organizationMemberRoles,
    nonDisabledAccounts,
    nonDisabledVolunteerAccounts,
    nonDisabledModAccounts,
  } = await runWithTimer(
    () =>
      seedAccountsAndRoles(prisma, {
        defaultAccountOptions: { include: true },
        runWithoutDb,
      }),
    '- Seeding accounts and roles...',
  );
  const defaultAccountIds = defaultAccounts.map((a) => a.id);

  const { contacts } = await runWithTimer(
    () => seedContacts(prisma, { accounts, runWithoutDb }),
    '- Seeding contacts...',
  );

  const { skills } = await runWithTimer(
    () => seedSkills(prisma, { runWithoutDb }),
    '- Seeding skills...',
  );

  await runWithTimer(
    () =>
      seedProfiles(prisma, accounts, skills, {
        importantAccountIds: defaultAccountIds,
        runWithoutDb,
      }),
    '- Seeding profiles...',
  );

  const { organizations, members } = await runWithTimer(
    () =>
      seedOrganizations(
        prisma,
        accounts,
        adminAccounts,
        modAccounts,
        volunteerAccounts,
        organizationMemberRoles,
        contacts,
        {
          runWithoutDb,
        },
      ),
    '- Seeding organizations...',
  );

  const { activities, shifts, shiftVolunteers, shiftSkills } =
    await runWithTimer(
      () =>
        seedActivities(
          prisma,
          organizations,
          members,
          skills,
          volunteerAccounts,
          modAccounts,
          adminAccounts,
          defaultAccounts,
          contacts,
          {
            runWithoutDb,
            joinIfMatchAccountPreferences: true,
            accountPreferences: {
              [defaultAccountIds[0]]: {
                skills: [SkillType.Health, SkillType.Education, SkillType.Job],
                locations: [
                  'Thủ Đức',
                  'Ho Chi Minh',
                  'Hồ Chí Minh',
                  'Bình Dương',
                  'Biên Hòa',
                  'Đồng Nai',
                ],
                startHour: [7, 8, 9, 15, 16],
                duration: [1, 2, 3, 4],
              },
            },
          },
        ),
      '- Seeding activities...',
    );

  const { profileSkills } = await runWithTimer(
    () =>
      seedProfileSkills(prisma, shifts, shiftVolunteers, shiftSkills, {
        runWithoutDb,
      }),
    '- Seeding profile skills...',
  );

  const { reports } = await runWithTimer(
    () =>
      seedReports(
        prisma,
        volunteerAccounts,
        adminAccounts,
        accounts,
        organizations,
        activities,
        {
          runWithoutDb,
          importantAccountIds: defaultAccountIds,
        },
      ),
    '- Seeding reports...',
  );

  const { chats } = await runWithTimer(
    () => seedChats(prisma, accounts, { runWithoutDb }),
    '- Seeding chats...',
  );

  await runWithTimer(
    () =>
      seedNotifications(
        prisma,
        accounts,
        activities,
        shifts,
        organizations,
        reports,
        chats,
        {
          runWithoutDb,
        },
      ),
    '- Seeding notifications...',
  );

  if (runWithoutDb) {
    return;
  }

  // Fix sequences
  await runWithTimer(async () => {
    await prisma.$executeRaw`SELECT setval('"Account_id_seq"', (SELECT MAX(id) from "Account"));`;
    await prisma.$executeRaw`SELECT setval('"AccountBan_id_seq"', (SELECT MAX(id) from "AccountBan"));`;
    await prisma.$executeRaw`SELECT setval('"AccountVerification_id_seq"', (SELECT MAX(id) from "AccountVerification"));`;
    await prisma.$executeRaw`SELECT setval('"Role_id_seq"', (SELECT MAX(id) from "Role"));`;
    await prisma.$executeRaw`SELECT setval('"Skill_id_seq"', (SELECT MAX(id) from "Skill"));`;
    await prisma.$executeRaw`SELECT setval('"Organization_id_seq"', (SELECT MAX(id) from "Organization"));`;
    await prisma.$executeRaw`SELECT setval('"Member_id_seq"', (SELECT MAX(id) from "Member"));`;
    await prisma.$executeRaw`SELECT setval('"Activity_id_seq"', (SELECT MAX(id) from "Activity"));`;
    await prisma.$executeRaw`SELECT setval('"Shift_id_seq"', (SELECT MAX(id) from "Shift"));`;
    await prisma.$executeRaw`SELECT setval('"VolunteerShift_id_seq"', (SELECT MAX(id) from "VolunteerShift"));`;
    await prisma.$executeRaw`SELECT setval('"Location_id_seq"', (SELECT MAX(id) from "Location"));`;
    await prisma.$executeRaw`SELECT setval('"Contact_id_seq"', (SELECT MAX(id) from "Contact"));`;
    await prisma.$executeRaw`SELECT setval('"File_id_seq"', (SELECT MAX(id) from "File"));`;
    await prisma.$executeRaw`SELECT setval('"Notification_id_seq"', (SELECT MAX(id) from "Notification"));`;
    await prisma.$executeRaw`SELECT setval('"Report_id_seq"', (SELECT MAX(id) from "Report"));`;
    await prisma.$executeRaw`SELECT setval('"ReportMessage_id_seq"', (SELECT MAX(id) from "ReportMessage"));`;
    await prisma.$executeRaw`SELECT setval('"Chat_id_seq"', (SELECT MAX(id) from "Chat"));`;
    await prisma.$executeRaw`SELECT setval('"ChatParticipant_id_seq"', (SELECT MAX(id) from "ChatParticipant"));`;
    await prisma.$executeRaw`SELECT setval('"ChatMessage_id_seq"', (SELECT MAX(id) from "ChatMessage"));`;
  }, 'Fixing sequences...');
};

const runWithTimer = async <T>(
  fn: () => Promise<T>,
  startMessage: string,
): Promise<T> => {
  const start = Date.now();
  console.log(startMessage);
  const res: T = await fn();
  console.log(` |_ ✓ Completed in ${(Date.now() - start) / 1000}s`);
  return res;
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
