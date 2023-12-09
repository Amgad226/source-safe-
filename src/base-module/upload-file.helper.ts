import { BadRequestException } from '@nestjs/common';
import { green, red } from 'colorette';
import { log } from 'console';
import * as fs from 'fs';
import * as path from 'path';

export interface fileInterface {
  fieldname: string; // string //"logo",
  originalname: string; // EDIT_copy.jpg,
  encoding: any; // 7bit,
  mimetype: string; // image/jpeg,
  destination: string; // ./upload,
  filename: string; // 1702054218898_EDIT_copy.jpg,
  path: string; // upload\\1702054218898_EDIT_copy.jpg,
  size: number; // 203876
}
export async function uploadToLocalDisk(
  files: Express.Multer.File | Express.Multer.File[],
  customName?: string,
  directoryPath = '',
  oldFilePath?: string,
  validation?: {
    size: number;
    mimetype: string;
    status: number;
    message: string;
  },
): Promise<fileInterface[]> {

  if (!Array.isArray(files)) {
    files = [files];
  }


  files.map((file) => {
    if (file == null || file == undefined) {
      throw new BadRequestException('file is required');
    }
  });

  if (validation) {
    files.forEach((file) => {
      if (file.size > validation.size) {
      }
      if (file.mimetype != validation.mimetype) {
      }
    });
  }

  const filesPaths = await Promise.all(
    files.map(async (file) => {
      const filePath = await saveFile(
        file,
        customName,
        directoryPath,
        oldFilePath,
      );

      return {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        destination: file.destination,
        filename: customName ?? file.filename,
        path: filePath,
        size: file.size,
      };
    }),
  );
  return filesPaths;
}

async function saveFile(
  file: Express.Multer.File,
  customName?: string,
  directoryPath?: string,
  oldFilePath?: string,
): Promise<string> {
  const uploadsDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'upload',
    directoryPath,
  );
  // Specify your desired directory
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // If customName is provided, use it; otherwise, use the original filename
  const timestamp = Date.now();
  const fileName = customName
    ? `${timestamp}_${customName}${path.extname(file.originalname)}`
    : `${timestamp}_${file.originalname}`;

  // If oldFilePath is provided, delete the old file
  if (oldFilePath) {
    deleteFile(oldFilePath);
  }

  const filePath = path.join(uploadsDir, `${fileName}`);

  return new Promise<string>((resolve, reject) => {
    // Write the binary data to the file
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        log(`file store in disk :` + green('/upload/' + fileName));
        resolve(`upload\\${fileName}`);
      }
    });
  });
}

export async function deleteFile(oldLocalFilePath: string): Promise<void> {
  oldLocalFilePath = path.join(
    __dirname,
    '../',
    '../',
    '../',
    oldLocalFilePath,
  );
  log(red('delete the local path :' + oldLocalFilePath));

  try {
    // Check if the file exists before attempting to delete
    await fs.promises.access(oldLocalFilePath);
    // Delete the file
    await fs.promises.unlink(oldLocalFilePath);
  } catch (error) {
    // Handle errors (e.g., file not found)
    console.error(`Error deleting image: ${error.message}`);
    throw new Error(`Unable to delete image: ${error.message}`);
  }
  return;
}
