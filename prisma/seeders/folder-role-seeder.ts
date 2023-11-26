import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

export async function folderRoleSeeder() {
  prisma.folderRole.create({
    data: {
      name: 'admin',
    },
  });

  prisma.folderRole.create({
    data: {
      name: 'user',
    },
  });
}
