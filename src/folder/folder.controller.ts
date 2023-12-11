import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { uploadToLocalDisk } from 'src/base-module/upload-file.helper';
import { FindAllParams } from 'src/base-module/pagination/find-all-params.decorator';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { ResponseInterface } from 'src/base-module/response.interface';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import { TokenPayload } from 'src/decorators/user-decorator';
import {
  CreateFolderProps,
  FileProps,
} from 'src/google-drive/props/create-folder.props';
import {
  UtilsAfterJobFunctionEnum,
  queueAction,
} from 'src/google-drive/utils-after-jobs.service';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';
import { FolderHelperService } from './folder.helper.service';

@Controller('folder')
export class FolderController extends BaseModuleController {
  constructor(
    private readonly folderService: FolderService,
    private myConfigService: MyConfigService,
    private folderHelper :FolderHelperService,
    @InjectQueue('google-drive') private readonly googleDriveQueue: Queue,
  ) {
    super();
  }
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() { name, parentFolderId }: CreateFolderDto,
    @UploadedFile() logo,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    let storedLogo = (await uploadToLocalDisk(logo, name))[0];
    const parentFolderDriveId =
      await this.folderHelper.getParentFolderDriveIds(parentFolderId);

    const newDbFolder = await this.folderService.create(
      { name, parentFolderIdDb: parentFolderDriveId.DbFolderId },
      storedLogo.path,
      tokenPayload,
    );

    // create folder in google drive
    const folderDetails: CreateFolderProps = {
      folderName: name,
      parentFolderId: parentFolderDriveId.DriveFolderId,
      afterUpload: {
        functionCall: UtilsAfterJobFunctionEnum.updateDriveFolderIDAfterUpload,
        data: { folderId: newDbFolder.id },
      },
    };

    this.googleDriveQueue.add('create-folder', folderDetails, queueAction);

    // upload the folder logo to google drive
    const logoDetails: FileProps = {
      folderDriveId: this.myConfigService.get(
        EnvEnum.GOOGLE_DRIVE_NEST_JS_FOLDERS_IMAGES_ID,
      ),
      localPath: storedLogo.path,
      filename: storedLogo.filename,
      mimetype: storedLogo.mimetype,
      originalname: storedLogo.originalname,
      afterUpload: {
        functionCall: UtilsAfterJobFunctionEnum.updateFolderLogoAfterUpload,
        data: { folderId: newDbFolder.id },
      },
    };
    this.googleDriveQueue.add('upload-file', logoDetails, queueAction);

    return this.successResponse({
      message: 'folder created successfully and will upload it to cloud ',
      status: 200,
    });
  }

  @Get()
  async findAll(
    @TokenPayload() tokenPayload: TokenPayloadType,
    @FindAllParams() params: QueryParamsInterface,
  ) {
    const folders = await this.folderService.findAll(tokenPayload, params);

    return this.successResponse({
      message: 'your folders',
      status: 200,
      data: folders,
    });
  }

  @Get(':id')
  async findOne(
    @TokenPayload() tokenPayload: TokenPayloadType,
    @Param('id') id: string,
  ) {
    // await this.folderHelper.checkIfHasFolderPermission(tokenPayload.user, +id);
    const folder = await this.folderService.findOne(+id);
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
    const request_users_count = await this.folderService.addUsers(
      +id,
      addUsersDto,
    );
    return this.successResponse({
      message: `${request_users_count} users added to request folder successfully`,
      status: 201,
    });
  }
}
