import { log } from "console";

export async function folderRoleSeeder(prisma) {

  await prisma.folderRole.create({
    data: {
      name: 'admin',
    },
  });

  await  prisma.folderRole.create({
    data: {
      name: 'user',
    },
  });
}
