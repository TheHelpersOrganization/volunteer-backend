import { AppPrismaClient } from 'src/prisma';

const prisma = new AppPrismaClient();

async function main() {
  console.log('🕓 Testing...');
  const start = Date.now();
  await prisma.connect();
  await test();
  console.log(`✅ Testing finished. Took ${(Date.now() - start) / 1000}s`);
}

async function test() {
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
