import { File } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  name: string;

  parentFolderId?: number;
}
