import { Injectable } from '@nestjs/common';
import { blue, red } from 'colorette';
import { error, log } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';
import { AfterUploadDataType } from './props/create-folder.props';
import { FileService } from 'src/file/file.service';
import { FileStatusEnum } from 'src/file/enums/file-status.enum';

export const queueAction = {
  removeOnComplete: true,
  removeOnFail: false,
};

export enum UtilsAfterJobFunctionEnum {
  updateFolderLogoAfterUpload = 'updateFolderLogoAfterUpload',
  updateDriveFolderIDAfterUpload = 'updateDriveFolderIDAfterUpload',
  updateFilePathAfterUpload = 'updateFilePathAfterUpload',
}
@Injectable()
export class UtilsAfterJob {
  constructor(private prisma: PrismaService,
    private fileService:FileService) {}

  async updateFilePathAfterUpload(data: AfterUploadDataType, link: string) {
    console.log('start updateFilePathAfterUpload');
return ;
//FIXME
    // if ('fileVersionId' in data) {
    //   const fileVersion = await this.prisma.fileVersion.update({
    //     where: {
    //       id: data.fileVersionId,
    //     },
    //     data: {
    //       path: link,
    //     },
    //   });
    //   await this.fileService.fileChangeStatus(
    //     fileVersion.file_id,
    //     data.user,
    //     FileStatusEnum.CHECKED_OUT,
    //   );
    // }
    // else {
    //     error(
    //       red(
    //         '$$$$$$$$$$$$$$$$$$$fileVersionId not found$$$$$$$$$$$$$$$$ UtilsAfterJob updateFilePathAfterUpload',
    //       ),
    //     );
    //   }
  }

  async updateFolderLogoAfterUpload(data: AfterUploadDataType, link: string) {
    console.log('start updateFolderLogoAfterUpload');

    if ('folderId' in data) {
      const Folder = await this.prisma.folder.update({
        where: { id: data.folderId },
        data: { logo: link },
      });
      log(blue(`update logo of folder in DB`));
    } else {
      error(
        red(
          '$$$$$$$$$$$$$$$$$$$folderId not found$$$$$$$$$$$$$$$$ UtilsAfterJob updateFolderLogoAfterUpload',
        ),
      );
    }
  }

  async updateDriveFolderIDAfterUpload(
    data: AfterUploadDataType,
    driveFolderID: string,
  ) {
    console.log('start updateDriveFolderIDAfterUpload');

    if ('folderId' in data) {
      const Folder = await this.prisma.folder.update({
        where: { id: data.folderId },
        data: { driveFolderID: driveFolderID },
      });
      log(blue(`update driveFolderID of folder in DB`));
    } else {
      error(
        red(
          '$$$$$$$$$$$$$$$$$$$folderId not found$$$$$$$$$$$$$$$$ UtilsAfterJob updateDriveFolderIDAfterUpload',
        ),
      );
    }
  }
}
