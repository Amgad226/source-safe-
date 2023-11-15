// src/google-drive/google-drive.service.ts
import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly oAuth2Client: any;

  constructor() {
    // Initialize your OAuth2 client in the constructor
    const credentials = {
      installed: {
        client_id:
          '1015794938517-i97tc3lltovl802glur19brbsdls9827.apps.googleusercontent.com',
        client_secret: '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',
        refresh_token:
          '1//04ACr_qhgorPNCgYIARAAGAQSNwF-L9Irt2ijx1bCpA-Xi7tPwTJFrO4M3s-ZM3tS7fOU6ezUDREqJv5j4j5BsxQBXrsk1kfLed8',
        redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'],
      },
    };
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );
    
    // Set the credentials
    this.oAuth2Client.setCredentials({
      refresh_token:
        '1//04ACr_qhgorPNCgYIARAAGAQSNwF-L9Irt2ijx1bCpA-Xi7tPwTJFrO4M3s-ZM3tS7fOU6ezUDREqJv5j4j5BsxQBXrsk1kfLed8',
    });
  }

  async uploadFile(file, folder) {
    if (!this.oAuth2Client) {
      throw new Error('OAuth2 client is not initialized.');
    }
    const drive = google.drive({ version: 'v3', auth: this.oAuth2Client });

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
      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
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
  async updateFilePermissions(fileId: string): Promise<void> {
    const drive = google.drive({ version: 'v3', auth: this.oAuth2Client });

    try {
      await drive.permissions.create({
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
