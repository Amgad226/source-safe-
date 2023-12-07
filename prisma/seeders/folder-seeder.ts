import { log } from 'console';

export async function folderSeeder(prisma) {
  const amgad = await prisma.user.findFirst({
    where: {
      email: 'amgad@gmail.com',
    },
    select: {
      id: true,
    },
  });
  const folder_admin_role = await prisma.folderRole.findFirst({
    where: {
      name: 'admin',
    },
    select: {
      id: true,
    },
  });

  await prisma.folder.create({
    data: {
      UserFolder: {
        create: {
          user_id: amgad.id,
          folder_role_id: folder_admin_role.id,
        },
      },
      name: 'root folder',
      logo: '',
      driveFolderID: '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw',
    },
  });
  
}
