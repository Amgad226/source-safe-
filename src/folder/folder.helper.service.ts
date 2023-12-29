import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Folder } from '@prisma/client';
import { log } from 'console';
import {
  UserTokenPayloadType
} from 'src/base-module/token-payload-interface';
import { fileInterface } from 'src/base-module/upload-file.helper';
import { FileStatusEnum } from 'src/file/enums/file-status.enum';
import {
  AfterUploadDataType,
  FileProps
} from 'src/google-drive/props/create-folder.props';
import { UtilsAfterJobFunctionEnum } from 'src/google-drive/utils-after-jobs.service';
import { PrismaService } from 'src/prisma/prisma.service';

export const queueAction = {
  removeOnComplete: true,
  removeOnFail: false,
};

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

  async checkIfHasFolderPermission(
    user: UserTokenPayloadType,
    folder_id: number,
    role = 'user',
  ): Promise<void> {
    let whereAdmin = {};
    if ((role == 'admin')) {
      const adminFolderRole = await this.prisma.folderRole.findFirst({
        where: { name: 'admin' },
      });
      whereAdmin = {
        folder_role_id: adminFolderRole.id,
      };
    }
    const userExistsInFolder = await this.prisma.userFolder.findFirst({
      where: {
        folder_id,
        user_id: user.id,
        ...whereAdmin,
      },
    });
    if (userExistsInFolder == null) {
      throw new UnauthorizedException(
        `unauthorize action , you do not have access for this folder: ${folder_id}`,
      );
    }
  }

  async checkIfHasFilePermission(
    user: UserTokenPayloadType,
    file_id: number,
    role = 'user',
  ): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: {
        id: file_id,
      },
    });
    if (file == null) {
      throw new NotFoundException(`file ${file_id} not found`);
    }
    await this.checkIfHasFolderPermission(user, file.folder_id, role);
  }
  async isFileStatus(
    file_id: number,
    fileStatus: FileStatusEnum = FileStatusEnum.CHECKED_IN,
  ) {
    const file = await this.prisma.file.findUnique({
      where: {
        id: file_id,
      },
    });
    log(
      file.status,
      fileStatus.toString(),
      file.status == fileStatus.toString(),
    );
    if (file.status == fileStatus.toString()) {
      throw new UnauthorizedException(
        `this file is ${file.status} , wait to unlock this file then `,
      );
    }
  }
  async isCheckedIn(id: number) {
    const checkIn = await this.prisma.checkIn.findFirst({
      where: {
        file_id:id,
      },
    });
    
    return checkIn != null ? true : false;
  }

  createFileDetailsObject(
    folder_driveFolderID: string,
    storedFile: fileInterface,
    functionCall: UtilsAfterJobFunctionEnum,
    data?: AfterUploadDataType,
  ): FileProps {
    const fileDetails: FileProps = {
      folderDriveId: folder_driveFolderID,
      localPath: storedFile.path,
      filename: storedFile.filename,
      mimetype: storedFile.mimetype,
      originalname: storedFile.originalname,
      afterUpload: {
        functionCall,
        data,
      },
    };
    return fileDetails;
  }
}
