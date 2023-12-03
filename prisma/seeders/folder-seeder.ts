import { log } from 'console';

export async function folderSeeder(prisma) {
  await prisma.folder.create({
    data: {
      name: 'root folder',
      logo: '',
      folder_id: null,
      driveFolderId: '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw',
    },
  });
}
