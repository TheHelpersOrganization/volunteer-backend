import fs from 'fs';

const migrationPath =
  process.argv[2] ?? 'prisma/migrations/000000000000_squashed_migrations';

fs.mkdirSync(migrationPath, { recursive: true });
fs.writeFileSync(`${migrationPath}/migration.sql`, '');
