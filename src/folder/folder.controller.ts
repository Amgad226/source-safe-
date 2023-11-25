import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { diskStorage } from 'multer';
import { FileProps } from 'src/google-drive/props/create-folder.props';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderService } from './folder.service';
import { BaseModuleController } from 'src/base-module/base-module.controller';

@Controller('folder')
export class FolderController extends BaseModuleController {
  constructor(
    private readonly folderService: FolderService,
    private prisma: PrismaService,

    @InjectQueue('google-drive') private readonly googleDriveQueue: Queue,
  ) {
    super();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}_${file.originalname}`);
        },
      }),
    }),
  )
  async create(
    @Body() { name, parentFolderId }: CreateFolderDto,
    @UploadedFile() logo,
  ) {
    const parentFolderIdNumber = parentFolderId as number;

    const parentDbFolder = await this.prisma.folder.findFirst({
      where: {
        id: 1, //FIXME  must put parentFolderIdNumber
      },
    });
    // return logo;
    const foldersImagesDriveId = '10NqH9S1H25YWJ9R8qa0Wj0qa5bstiA3_'; // the folders images drive id
    const parentFolderDriveId =
      parentDbFolder.driveFolderID ?? '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw'; // if the folder not found store in the root folder

    let fileDetails: FileProps = {
      folderDriveId: foldersImagesDriveId, //  google drive folder id
      localPath: logo.path, // stored image path in local storage
      filename: logo.filename, // the file name with his mime type with timestamp
      mimetype: logo.mimetype, // file mime type
      originalname: logo.originalname, // the file name with his mime type
    };
    const newDbFolder = await this.folderService.create(
      { name, parentFolderId: 1 },
      fileDetails,
    );

    this.googleDriveQueue.add(
      'create-folder',
      {
        folderName: name,
        parentFolderId: parentFolderDriveId,
        folderIdDb: newDbFolder.id,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    fileDetails.DbFileId = newDbFolder.id;
    this.googleDriveQueue.add('upload-file', fileDetails, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    return 'file uploaded successfully '; //FIXME - must return general response not string in response
  }

  @Get()
  async findAll() {
    return await this.folderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.folderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto) {
    return this.folderService.update(+id, updateFolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.folderService.remove(+id);
  }
}
