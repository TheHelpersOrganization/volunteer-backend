import { AppPrismaClient } from '@app/prisma';
import { CallbackHandler, Response } from 'supertest';

export const deleteAllDatabaseData = async () => {
  const prisma = new AppPrismaClient();
  await prisma.connect();

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
  await prisma.$disconnect();
};

export const logIfError: CallbackHandler = (err: any, res: Response) => {
  if (err) {
    console.log(err.message);
  }
};
