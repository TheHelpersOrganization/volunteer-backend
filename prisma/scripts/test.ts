import { NotificationType } from 'src/notification/constants';
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
  await prisma.notification.updateMany({
    where: {
      type: NotificationType.Chat,
    },
    data: {
      pushOnly: true,
    },
  });
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
