import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Folder } from '@prisma/client';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { PrismaService } from 'src/prisma/prisma.service';

export const queueAction = {
  removeOnComplete: true,
  removeOnFail: false,
};

export enum UtilsAfterJobFunctionEnum {
  updateFolderLogoAfterUpload = 'updateFolderLogoAfterUpload',
  updateDriveFolderIDAfterUpload = 'updateDriveFolderIDAfterUpload',
}
@Injectable()
export class FolderHelperService {
  constructor(private prisma: PrismaService) {}
  public async getParentFolderDriveIds(
    parentFolderId: number | string,
  ): Promise<{ DriveFolderId: string; DbFolderId: number }> {
    let drive_folderId: string;
    let DbFolderId: number;

    // if i receive folder_id i will get the (googleDrive folder id) by this folder id
    if (parentFolderId != null) {
      const folder_db = await this.resolveParentFolderId(parentFolderId);
      drive_folderId = folder_db.driveFolderID;
      DbFolderId = folder_db.id;
    }
    // else i will get the googleDrive folder id  and store inside them
    else {
      drive_folderId = '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw'; // root folder id in drive
      let rootDbFolder = await this.prisma.folder.findFirst({
        where: { name: 'root folder', driveFolderID: drive_folderId },
        select: { id: true },
      });
      DbFolderId = rootDbFolder.id;
    }

    return {
      DriveFolderId: drive_folderId,
      DbFolderId: DbFolderId,
    };
  }
  private async resolveParentFolderId(
    parentFolderId: number | string,
  ): Promise<Folder> {
    if (typeof parentFolderId !== 'number') {
      parentFolderId = parseInt(parentFolderId, 10);
    }

    if (isNaN(parentFolderId) || !Number.isSafeInteger(parentFolderId)) {
      throw new UnprocessableEntityException('parentFolderId must be a number');
    }

    const parentDbFolder = await this.prisma.folder.findFirst({
      where: { id: parentFolderId },
    });

    if (!parentDbFolder) {
      throw new NotFoundException('parentFolderId invalid');
    }

    return parentDbFolder;
  }

  public async isAdminInFolder(
    folder_id: number,
    tokenPayload: TokenPayloadProps,
  ) {
    const adminFolderRole = await this.prisma.folderRole.findFirst({
      where: { name: 'admin' },
    });
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folder_id,
        UserFolder: {
          some: {
            folder_role_id: adminFolderRole.id,
            user_id: tokenPayload.user.id,
          },
        },
      },
    });
    if (!folder) {
      throw new UnauthorizedException('unauthorized');
    }
    return folder;
  }
}
