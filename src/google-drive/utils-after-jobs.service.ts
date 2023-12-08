import { Injectable } from '@nestjs/common';
import { blue, red } from 'colorette';
import { error, log } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';
import { AfterUploadDataType } from './props/create-folder.props';

export const queueAction = {
  removeOnComplete: true,
  removeOnFail: false,
};

export enum UtilsAfterJobFunctionEnum {
  updateFolderLogoAfterUpload = 'updateFolderLogoAfterUpload',
  updateDriveFolderIDAfterUpload = 'updateDriveFolderIDAfterUpload',
}
@Injectable()
export class UtilsAfterJob {
  constructor(private prisma: PrismaService) {}
  async updateFolderLogoAfterUpload(data: AfterUploadDataType, link: string) {
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
