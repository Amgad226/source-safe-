import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { diskStorage } from 'multer';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { TokenPayload } from 'src/decorators/user-decorator';
import { FileProps } from 'src/google-drive/props/create-folder.props';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderService } from './folder.service';
import { ResponseInterface } from 'src/base-module/response.interface';
import { ExistsInDatabase } from 'src/validator/a';
import { Prisma } from '@prisma/client';
import { AddUsersDto } from './dto/add-users.dto';

@Controller('folder')
export class FolderController extends BaseModuleController {
  constructor(
    private readonly folderService: FolderService,
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
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        errorHttpStatusCode: 400,
        validators: [new FileTypeValidator({ fileType: /(jpg|jpeg|png)/ })],
      }),
    )
    logo,
    @TokenPayload() tokenPayload: TokenPayloadProps,
  ): Promise<ResponseInterface> {
    const parentFolderDriveId =
      await this.folderService.getParentFolderDriveIds(parentFolderId);

    const foldersImagesDriveId = '10NqH9S1H25YWJ9R8qa0Wj0qa5bstiA3_';

    const fileDetails: FileProps = {
      folderDriveId: foldersImagesDriveId,
      localPath: logo.path,
      filename: logo.filename,
      mimetype: logo.mimetype,
      originalname: logo.originalname,
      DbFileId: null,
    };

    const newDbFolder = await this.folderService.create(
      { name, parentFolderIdDb: parentFolderDriveId.DbFolderId },
      fileDetails,
      tokenPayload,
    );
    fileDetails.DbFileId = newDbFolder.id;

    this.googleDriveQueue.add(
      'create-folder',
      {
        folderName: name,
        parentFolderId: parentFolderDriveId.DriveFolderId,
        folderIdDb: newDbFolder.id,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.googleDriveQueue.add('upload-file', fileDetails, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    return this.successResponse({
      message: 'folder created successfully and will upload it to cloud ',
      status: 200,
    });
  }

  @Get()
  async findAll(@TokenPayload() tokenPayload: TokenPayloadProps) {
    const folders = await this.folderService.findAll(tokenPayload);

    return this.successResponse({
      message: 'your folders',
      status: 200,
      data: folders,
    });
  }

  @Get(':id')
  // @UsePipes(ExistsInDatabase('folder')) // Assuming 'folder' is the Prisma entity or table name
  async findOne(
    @TokenPayload() tokenPayload: TokenPayloadProps,
    @Param('id') id: string,
  ) {
    const folder = await this.folderService.findOne(+id, tokenPayload);
    return this.successResponse({
      message: 'folder info',
      status: 200,
      data: folder,
    });
  }

  @Put(':id/add-users')
  async addUsers(
    @Param('id') id: number,
    @Body() addUsersDto: AddUsersDto,
  ): Promise<ResponseInterface> {
    const request_users_count = await this.folderService.addUsers(+id, addUsersDto);
    return this.successResponse({
      message: `${request_users_count} users added to request folder successfully`,
      status: 201,
    });
  }
}
