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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { FindAllParams } from 'src/base-module/pagination/find-all-params.decorator';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { uploadToLocalDisk } from 'src/base-module/upload-file.helper';
import { TokenPayload } from 'src/decorators/user-decorator';
import { FolderHelperService } from 'src/folder/folder.helper.service';
import { FileProps } from 'src/google-drive/props/create-folder.props';
import { UtilsAfterJobFunctionEnum } from 'src/google-drive/utils-after-jobs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileService } from './file.service';
import { BaseModuleController } from 'src/base-module/base-module.controller';

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
    @TokenPayload() tokenPayload: TokenPayloadProps,
    @UploadedFile() file,
  ) {
    await this.folderHelper.checkIfHasFolderPermission(
      tokenPayload.user,
      +createFileDto.folder_id,
      'admin',
    );

    const storedFile = (await uploadToLocalDisk(file, createFileDto.name))[0];

    const db_file = await this.fileService.create(
      createFileDto,
      storedFile,
      tokenPayload,
    );

    const fileDetails: FileProps = {
      folderDriveId: db_file.folder.driveFolderID,
      localPath: storedFile.path,
      filename: storedFile.filename,
      mimetype: storedFile.mimetype,
      originalname: storedFile.originalname,
      afterUpload: {
        functionCall: UtilsAfterJobFunctionEnum.updateFilePathAfterUpload,
        data: {
          fileVersionId:
            db_file.file_versions[db_file.file_versions.length - 1].id,
        },
      },
    };

    this.googleDriveQueue.add('upload-file', fileDetails, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    return this.successResponse({
      message: 'file created successfully and will upload it to cloud',
      status: 201,
    });
  }

  @Get()
  async findAll(
    @Query('folder_id', ParseIntPipe) folder_id: number,
    @TokenPayload() tokenPayload: TokenPayloadProps,
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
    @TokenPayload() tokenPayload: TokenPayloadProps,
  ) {
    await this.folderHelper.checkIfHasFilePermission(tokenPayload.user, +id);

    const file = await this.fileService.findOne(+id);
    return this.successResponse({
      status: 200,
      message: 'retrieve file info',
      data: file,
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
}
