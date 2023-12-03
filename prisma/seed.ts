import { PrismaClient } from '@prisma/client';
import { userSeeder } from './seeders/user-seeder';
import { truncate } from './seeders/truncate-seeder';
import { folderRoleSeeder } from './seeders/folder-role-seeder';
import { ConfigService } from '@nestjs/config';
import { folderSeeder } from './seeders/folder-seeder';

const prisma = new PrismaClient();
const configService = new ConfigService();
const APP_ENV = configService.get('APP_ENV');
async function main() {
  if (APP_ENV == 'local' || APP_ENV == null) await truncate(prisma);
  await userSeeder(prisma);
  await folderRoleSeeder(prisma);
  await folderSeeder(prisma);
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
