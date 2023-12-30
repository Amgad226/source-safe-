import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { deleteFile } from 'src/base-module/upload-file.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleDriveService } from './google-drive.service';
import { CreateFolderProps, FileProps } from './props/create-folder.props';
import { UtilsAfterJob } from './utils-after-jobs.service';

@Processor('google-drive')
export class GoogleDriveConsumer {
  constructor(
    private googleDriveService: GoogleDriveService,
    private prisma: PrismaService,
    private utilsAfterJob: UtilsAfterJob,
  ) {}

  @Process('upload-file')
  async handleUploadFile(job: Job) {
    let file: FileProps = {
      localPath: job.data.localPath,
      filename: job.data.filename,
      mimetype: job.data.mimetype,
      folderDriveId: job.data.folderDriveId,
      originalname: job.data.originalname,
      afterUpload: job.data.afterUpload,
    };
    console.log('start @Process(upload-file)');
    const link = await this.googleDriveService.uploadFileToDrive(file);
    
    // await deleteFile(file.localPath);
    await this.utilsAfterJob[file.afterUpload.functionCall](
      file.afterUpload.data,
      link,
    );
  }

  @Process('create-folder')
  async handleCreateFolder(job: Job) {
    let folder: CreateFolderProps = {
      folderName: job.data.folderName,
      parentFolderId: job.data.parentFolderId,
      afterUpload: job.data.afterUpload,
    };
    console.log('start @Process(create-folder)');

    const folderDriveLink = await this.googleDriveService.createFolder(folder);
    await this.utilsAfterJob[folder.afterUpload.functionCall](
      folder.afterUpload.data,
      folderDriveLink,
    );
  }
}
