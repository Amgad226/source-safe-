import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { GoogleDriveService } from './google-drive.service';

@Processor('google-drive')
export class GoogleDriveConsumer {
  constructor(private googleDriveService: GoogleDriveService) {}

  @Process('upload-file')
  async handleUploadFile(job: Job) {
    const link = await this.googleDriveService.uploadFile(
      job.data.file,
      job.data.folder,
    );
    console.log(link);
  }

  @Process('create-folder')
  async handleCreateFolder(job: Job) {
    await this.googleDriveService.createFolder({
      folderName: job.data.folderName,
      parentFolderId: job.data.parentFolderId,
    });
  }
}
