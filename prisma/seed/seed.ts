import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import { AppPrismaClient } from 'src/prisma';
import { seedAccountsAndRoles } from './seed-account-role';
import { seedActivities } from './seed-activity';
import { seedOrganizations } from './seed-organization';
import { seedProfiles } from './seed-profile';
import { seedSkills } from './seed-skill';

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
  const {
    accounts,
    adminAccounts,
    modAccounts,
    volunteerAccounts,
    defaultAccounts,
  } = await runWithTimer(
    () =>
      seedAccountsAndRoles(prisma, {
        defaultAccountOptions: { include: true },
      }),
    '- Seeding accounts and roles...',
  );

  const { skills } = await runWithTimer(
    () => seedSkills(prisma),
    '- Seeding skills...',
  );

  await runWithTimer(
    () => seedProfiles(prisma, accounts, skills),
    '- Seeding profiles...',
  );

  const { organizations } = await runWithTimer(
    () =>
      seedOrganizations(
        prisma,
        accounts,
        adminAccounts,
        modAccounts,
        volunteerAccounts,
      ),
    '- Seeding organizations...',
  );

  await runWithTimer(
    () =>
      seedActivities(
        prisma,
        organizations,
        skills,
        volunteerAccounts,
        modAccounts,
        defaultAccounts,
      ),
    '- Seeding activities...',
  );

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
