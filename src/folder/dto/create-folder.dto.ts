import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  name: string;

  // @IsNotEmpty()
  readonly logo: Express.Multer.File;

  @IsOptional()
  @Transform(({ value }) => {
    const intValue = parseInt(value, 10);
    return isNaN(intValue) ? value : intValue;
  })
  @IsInt({ message: 'parentFolderId must be a valid integer' })
  parentFolderId?: number;
}
