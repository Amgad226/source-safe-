// src/google-drive/google-drive.service.ts
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InitializeOnPreviewAllowlist } from '@nestjs/core';
import { Queue } from 'bull';
import { log } from 'console';
import { google, drive_v3 } from 'googleapis';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { Readable } from 'stream';
import { CreateFolderProps } from './props/create-folder.props';

@Injectable()
export class GoogleDriveService {
  private oAuth2Client: any;
  private drive: any;
  constructor(private myConfigService: MyConfigService) {
    this.initializeOAuth2Client();
  }

  private async initializeOAuth2Client(): Promise<void> {
    this.oAuth2Client = new google.auth.OAuth2(
      this.myConfigService.get(EnvEnum.GOOGLE_DRIVE_CLIENT_ID),
      this.myConfigService.get(EnvEnum.GOOGLE_DRIVE_CLIENT_SECRET),
      this.myConfigService.get(EnvEnum.GOOGLE_DRIVE_REDIRECT_URL_1),
    );
    this.oAuth2Client.setCredentials({
      refresh_token: this.myConfigService.get(
        EnvEnum.GOOGLE_DRIVE_REFRESH_TOKEN,
      ),
    });
    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
  }

  async uploadFile(file, folder) {
    if (!this.oAuth2Client) {
      throw new Error('OAuth2 client is not initialized.');
    }

    // name and location file
    const fileMetadata: drive_v3.Schema$File = {
      name: file.originalname,
      parents: [folder],
    };

    // the file info
    const media = {
      mimeType: file.mimetype,
      body: new Readable({
        read() {
          this.push(Buffer.from(file.buffer));
          this.push(null);
        },
      }),
    };

    try {
      // send to google drive
      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
        parents: [], // Specify parent folder IDs if needed
        permissions: [
          {
            role: 'reader',
            type: 'anyone',
          },
        ],
      });

      const fileId = file?.data.id;

      // update Permission for this file to make it public
      await this.updateFilePermissions(fileId);

      // get public link instead of embedded link
      return this.getShareableLink(fileId);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error('Failed to upload file to Google Drive.');
    }
  }
  async createFolder({
    folderName,
    parentFolderId,
  }: CreateFolderProps): Promise<string> {
    const requestBody: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (this.myConfigService.get(EnvEnum.GOOGLE_DRIVE_NEST_JS_FOLDER)) {
      requestBody.parents = [parentFolderId];
    }

    const response = await this.drive.files.create({
      requestBody,
    });
    log(response.data);
    return response.data.id;
  }
  async updateFilePermissions(fileId: string): Promise<void> {
    return  ;
    try {
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log('File permissions updated successfully.');
    } catch (error) {
      console.error('Error updating file permissions:', error.message);
      throw new Error('Failed to update file permissions.');
    }
  }
  private getShareableLink(fileId: string): string {
    console.log(fileId);

    return `https://drive.google.com/uc?id=${fileId}`;
  }
}
