import { PrismaClient } from '@prisma/client';
import { userSeeder } from './seeders/user-seeder';
import { truncate } from './seeders/truncate-seeder';

const prisma = new PrismaClient();

async function main() {
    // await truncate()
    await userSeeder()
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
