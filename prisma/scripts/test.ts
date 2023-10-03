import { AppPrismaClient } from '@app/prisma';
import { S3 } from '@aws-sdk/client-s3';
import { requireNonNullish } from 'prisma/seed/utils';

const prisma = new AppPrismaClient();

async function main() {
  console.log('🕓 Testing...');
  const start = Date.now();
  await prisma.connect();
  await test();
  console.log(`✅ Testing finished. Took ${(Date.now() - start) / 1000}s`);
}

async function test() {
  const s3Client = new S3({
    endpoint: process.env.FILE_ENDPOINT,
    region: process.env.FILE_REGION,
    credentials: {
      accessKeyId: requireNonNullish(process.env.FILE_ACCESS_KEY),
      secretAccessKey: requireNonNullish(process.env.FILE_SECRET_KEY),
    },
  });
  const bucket = requireNonNullish(process.env.FILE_BUCKET);
  try {
    console.log('-| Deleting objects in batches');
    const batchIndex = 1;
    let objects = await s3Client.listObjectsV2({ Bucket: bucket });
    while (objects.Contents) {
      console.log(
        ` |_ Batch ${batchIndex}: Deleting ${objects.Contents.length} objects`,
      );
      await s3Client.deleteObjects({
        Bucket: bucket,
        Delete: {
          Objects: objects.Contents.map((obj) => ({ Key: obj.Key })),
        },
      });
      objects = await s3Client.listObjectsV2({ Bucket: bucket });
    }
  } catch (err) {
    console.error('Failed to reset bucket');
    console.log(err);
    return;
  }
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
