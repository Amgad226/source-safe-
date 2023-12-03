import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GoogleDriveService } from './google-drive.service';
import { log } from 'console';
import { CreateFolderProps, FileProps } from './props/create-folder.props';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Processor('google-drive')
export class GoogleDriveConsumer {
  constructor(
    private googleDriveService: GoogleDriveService,
    private prisma: PrismaService,
  ) {}

  @Process('upload-file')
  async handleUploadFile(job: Job) {
    let file: FileProps = {
      localPath: job.data.localPath,
      filename: job.data.filename,
      mimetype: job.data.mimetype,
      folderDriveId: job.data.folderDriveId,
      originalname: job.data.originalname,
      DbFileId: job.data.DbFileId,
    };
    const link = await this.googleDriveService.uploadFileToDrive(file);
    const Folder = await this.prisma.folder.update({
      where: { id: file.DbFileId },
      data: { logo: link },
    });
    const imagePath = path.join(__dirname, '../', '../','../', file.localPath);
console.log(imagePath)
    try {
    //   // Check if the file exists before attempting to delete
      await fs.promises.access(imagePath);
    //   // Delete the file
      await fs.promises.unlink(imagePath);
    } catch (error) {
    //   // Handle errors (e.g., file not found)
      console.error(`Error deleting image: ${error.message}`);
    //   throw new Error(`Unable to delete image: ${error.message}`);
    }
    console.log(link);
  }

  @Process('create-folder')
  async handleCreateFolder(job: Job) {
    const folderDriveLink = await this.googleDriveService.createFolder({
      folderName: job.data.folderName,
      parentFolderId: job.data.parentFolderId,
      folderIdDb: job.data.folderIdDb,
    });
    const Folder = await this.prisma.folder.update({
      where: { id: job.data.folderIdDb },
      data: { driveFolderID: folderDriveLink },
    });
  }
}
