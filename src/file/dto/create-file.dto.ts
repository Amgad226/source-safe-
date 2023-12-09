import { IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  folder_id: number;

  // @IsNotEmpty()
  file: Express.Multer.File;
}
