import { AppPrismaClient } from 'src/prisma';

const prisma = new AppPrismaClient();

async function main() {
  console.log('🕓 Testing...');
  const start = Date.now();
  await prisma.connect();
  await test();
  console.log(`✅ Testing finished. Took ${(Date.now() - start) / 1000}s`);
}

export const seedActivities = async (options?: {
  activityPerOrganization?: {
    min?: number;
    max?: number;
  };
  accountPreferences?: {
    [id: number]: {
      locations?: string[];
    };
  };
}) => {
  console.log(options?.accountPreferences?.[1]?.locations);
  const locations = options?.accountPreferences?.[1]?.locations;
  const res = ['a'].some((x) => {
    if (locations?.includes(x)) {
      return true;
    }
    return false;
  });
  console.log(res);
};

async function test() {
  const ids = [1, 2];
  const locations = ['a', 'bc'];
  seedActivities({
    accountPreferences: {
      [ids[0]]: {
        locations: ['a', 'b'],
      },
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
