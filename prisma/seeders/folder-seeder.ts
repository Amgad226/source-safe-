import { log } from 'console';

export async function folderSeeder(prisma) {
  await prisma.folder.create({
    data: {
      name: 'root folder',
      logo: '',
      driveFolderID: '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw',
    },
  });
}
