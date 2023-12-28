import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { Response } from 'express';
import * as fs from 'fs';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { FindAllParams } from 'src/base-module/pagination/find-all-params.decorator';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import {
  fileInterface,
  uploadToLocalDisk,
} from 'src/base-module/upload-file.helper';
import { signUrl, validateSignedUrl } from 'src/base-module/url-signing.helper';
import { Public } from 'src/decorators/public.decorators';
import { TokenPayload } from 'src/decorators/user-decorator';
import { FolderHelperService } from 'src/folder/folder.helper.service';
import {
  AfterUploadDataType,
  FileProps,
} from 'src/google-drive/props/create-folder.props';
import { UtilsAfterJobFunctionEnum } from 'src/google-drive/utils-after-jobs.service';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
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
    private myConfigService: MyConfigService,
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
          user:tokenPayload.user
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
  @Get('my-trash')
  async removedFiles(
    @TokenPayload() tokenPayload: TokenPayloadType,
    @FindAllParams() params: QueryParamsInterface,
  ) {

    return this.successResponse({
      message: 'all removed files',
      status: 200,
      data: await this.fileService.removedFiles( params,tokenPayload),
    });
  }

  @Public()
  @Get('download')
  async downloadLink(@Query('link') link: string) {
    if (link.startsWith('https://drive.google.com/uc?id='))
      return link + '&export=download';
    else {
      const host = this.myConfigService.get(EnvEnum.HOST) ;
      if (!host){
        throw new BadRequestException('add host to env')
      }
      return signUrl(
        `${this.myConfigService.get(EnvEnum.HOST)}/file/disk-download`,
        link,
        90,
      );
    }
  }
  @Public()
  @Get('disk-download')
  async downloadLocalLink(
    @Query('url') url: string,
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('expires') expires: string,
    @Res() res: Response,
  ) {
    const checkUrl = validateSignedUrl(
      url,
      signature,
      timestamp,
      nonce,
      expires,
    );
    if (checkUrl.status == false) {
      return res.status(400).send(checkUrl.msg);
    }
    if (fs.existsSync(url)) {
      // Content-Disposition header suggests that the content should be treated as an attachment
      // and specifies the default filename for the downloaded file.
      res.header(
        'Content-Disposition',
        `attachment; filename=${url.replace(/\\/g, '/').split('/').pop()}`,
      );

      // Content-Type header indicates the media type of the resource.
      // In this case, it is set to 'application/octet-stream' to treat the content as binary data.
      res.header('Content-Type', 'application/octet-stream');

      // Stream the file to the response
      const fileStream = fs.createReadStream(url);
      fileStream.pipe(res);
    } else {
      // File not found
      res.status(404).send('File not found');
    }
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

  @Get('/auth/check-in')
  async checkInByMe(
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    const file = await this.fileService.checkInByMe(tokenPayload.user);
    return this.successResponse({
      status: 200,
      message: 'retrieve my check in files',
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
    if(uploadedFile.mimetype != db_file.extension){
      throw new BadRequestException('this file extension mismatched with original file extension')
    }
    const storedFile = (await uploadToLocalDisk(uploadedFile, db_file.name))[0];
    const version= await this.fileService.createVersion(+id, tokenPayload.user, storedFile);
    await this.fileService.fileChangeStatus(
      +id,
      tokenPayload.user,
      FileStatusEnum.PROCESSING,
    );
    await this.fileService.deleteCheckIn(+id, tokenPayload.user);

    this.createFileDetailsObjectAndServeToQueue(
      db_file.folder.driveFolderID,
      storedFile,
      UtilsAfterJobFunctionEnum.updateFilePathAfterUpload,
      {
        fileVersionId:
        version.id,
      },
    );

    return this.successResponse({
      message: 'file checked out successfully and file will upload it to cloud',
      status: 201,
    });
  }

  @Post(':id/force-check-out')
  @UseInterceptors(FileInterceptor('file'))
  async forceCheckOut(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    await this.folderHelper.checkIfHasFilePermission(tokenPayload.user, +id,'admin');

    if (!(await this.folderHelper.isCheckedIn(+id))) {
      throw new UnauthorizedException('this file is free and not checked in ');
    }

    await this.fileService.fileChangeStatus(
      +id,
      tokenPayload.user,
      FileStatusEnum.CHECKED_OUT,
      'FORCE checkout by folder admin,'
    );
    await this.fileService.deleteCheckIn(+id, tokenPayload.user);

    

    return this.successResponse({
      message: 'file checked out successfully',
      status: 200,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    await this.folderHelper.checkIfHasFilePermission(
      tokenPayload.user,
      +id,
      'admin',
    );
    return this.successResponse({
      message: 'file deleted successfully ',
      status: 200,
      data: this.fileService.remove(+id),
    });
  }
  @Post('restore/:id')
  async restore(
    @Param('id') id: string,
    @TokenPayload() tokenPayload: TokenPayloadType,
  ) {
    await this.folderHelper.checkIfHasFilePermission(
      tokenPayload.user,
      +id,
      'admin',
    );
    return this.successResponse({
      message: 'file restored successfully',
      status: 200,
      data: this.fileService.restore(+id),
    });
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
