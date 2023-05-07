import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import { PrismaClient } from '@prisma/client';
import { seedAccountsAndRoles } from './seed-account-role';
import { seedActivities } from './seed-activity';
import { seedOrganizations } from './seed-organization';
import { seedProfiles } from './seed-profile';
import { seedSkills } from './seed-skill';

fakerEn.seed(1);
fakerVi.seed(1);

const prisma = new PrismaClient();

async function main() {
  const { accounts, adminAccounts, modAccounts, volunteerAccounts } =
    await seedAccountsAndRoles(prisma);
  const { skills } = await seedSkills(prisma);
  await seedProfiles(prisma, accounts, skills);
  const { organizations } = await seedOrganizations(
    prisma,
    accounts,
    adminAccounts,
    modAccounts,
    volunteerAccounts,
  );
  await seedActivities(prisma, organizations, skills, volunteerAccounts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
