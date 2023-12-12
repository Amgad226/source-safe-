import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { FindAllParams } from 'src/base-module/pagination/find-all-params.decorator';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import {
  fileInterface,
  uploadToLocalDisk,
} from 'src/base-module/upload-file.helper';
import { TokenPayload } from 'src/decorators/user-decorator';
import { FolderHelperService } from 'src/folder/folder.helper.service';
import {
  AfterUploadDataType,
  FileProps,
} from 'src/google-drive/props/create-folder.props';
import { UtilsAfterJobFunctionEnum } from 'src/google-drive/utils-after-jobs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileStatusEnum } from './enums/file-status.enum';
import { FileService } from './file.service';

@Controller('file')
export class FileController extends BaseModuleController {
  constructor(
    private readonly fileService: FileService,
    private folderHelper: FolderHelperService,
    private prisma: PrismaService,
    @InjectQueue('google-drive') private readonly googleDriveQueue: Queue,
  ) {
    super();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createFileDto: CreateFileDto,
    @TokenPayload() tokenPayload: TokenPayloadType,
    @UploadedFile() file,
  ) {
    await this.folderHelper.checkIfHasFolderPermission(
      tokenPayload.user,
      +createFileDto.folder_id,
      'admin',
    );

    const storedFile: fileInterface = (
      await uploadToLocalDisk(file, createFileDto.name)
    )[0];

    const db_file = await this.fileService.create(
      createFileDto,
      storedFile,
      tokenPayload,
    );
    this.createFileDetailsObjectAndServeToQueue(
      db_file.folder.driveFolderID,
      storedFile,
      UtilsAfterJobFunctionEnum.updateFilePathAfterUpload,
      {
        fileVersionId:
          db_file.file_versions[db_file.file_versions.length - 1].id,
      },
    );

    return this.successResponse({
      message: 'file created successfully and will upload it to cloud',
      status: 201,
    });
  }

  @Get()
  async findAll(
    @Query('folder_id', ParseIntPipe) folder_id: number,
    @TokenPayload() tokenPayload: TokenPayloadType,
    @FindAllParams() params: QueryParamsInterface,
  ) {
    await this.folderHelper.checkIfHasFolderPermission(
      tokenPayload.user,
      +folder_id,
    );
    const files = await this.fileService.findAll(params, folder_id);
    return this.successResponse({
      status: 200,
      message: 'files in this folder ',
      data: files,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    await this.folderHelper.checkIfHasFilePermission(tokenPayload.user, +id);

    const file = await this.fileService.findOne(+id);
    return this.successResponse({
      status: 200,
      message: 'retrieve file info',
      data: file,
    });
  }

  @Post(':id/check-in')
  async checkIn(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    await this.folderHelper.checkIfHasFilePermission(tokenPayload.user, +id);
    if (await this.folderHelper.isCheckedIn(+id)) {
      throw new UnauthorizedException('this file already checked in ');
    }
    await this.fileService.storeCheckIn(+id, tokenPayload.user);
    await this.fileService.fileChangeStatus(
      +id,
      tokenPayload.user,
      FileStatusEnum.CHECKED_IN,
    );
    return this.successResponse({
      status: 200,
      message: 'file checked in',
    });
  }

  @Post(':id/check-out')
  @UseInterceptors(FileInterceptor('file'))
  async checkOut(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadType,
    @UploadedFile() uploadedFile,
  ) {
    await this.folderHelper.checkIfHasFilePermission(tokenPayload.user, +id);

    if (!(await this.folderHelper.isCheckedIn(+id))) {
      throw new UnauthorizedException('this file is free and not checked in ');
    }

    const isUserCheckedIn = await this.fileService.checkedInByAuthUser(
      +id,
      tokenPayload.user,
    );
    if (!isUserCheckedIn) {
      throw new UnauthorizedException(
        'you cant check out file not checked in by you',
      );
    }
    const db_file = await this.fileService.findOne(+id);
    const storedFile = (await uploadToLocalDisk(uploadedFile, db_file.name))[0];
    await this.fileService.createVersion(+id, tokenPayload.user, storedFile);
    await this.fileService.fileChangeStatus(
      +id,
      tokenPayload.user,
      FileStatusEnum.CHECKED_OUT,
    );
    await this.fileService.deleteCheckIn(+id, tokenPayload.user);

    this.createFileDetailsObjectAndServeToQueue(
      db_file.folder.driveFolderID,
      storedFile,
      UtilsAfterJobFunctionEnum.updateFilePathAfterUpload,
      {
        fileVersionId:
          db_file.file_versions[db_file.file_versions.length - 1].id,
      },
    );

    return this.successResponse({
      message: 'file checked out successfully and file will upload it to cloud',
      status: 201,
    });
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }

  private createFileDetailsObjectAndServeToQueue(
    folder_driveFolderID: string,
    storedFile: fileInterface,
    functionCall: UtilsAfterJobFunctionEnum,
    data?: AfterUploadDataType,
  ) {
    const fileDetails: FileProps = this.folderHelper.createFileDetailsObject(
      folder_driveFolderID,
      storedFile,
      functionCall,
      data,
    );
    this.googleDriveQueue.add('upload-file', fileDetails, {
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
