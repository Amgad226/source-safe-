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
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
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

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private folderHelper: FolderHelperService,
    private prisma: PrismaService,
    @InjectQueue('google-drive') private readonly googleDriveQueue: Queue,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createFileDto: CreateFileDto,
    @TokenPayload() tokenPayload: TokenPayloadProps,
    @UploadedFile() file,
  ) {
    const folder = await this.folderHelper.isAdminInFolder(
      +createFileDto.folder_id,
      tokenPayload,
    );

    const storedFile = (await uploadToLocalDisk(file, createFileDto.name))[0];

    const folderDriveId = folder.driveFolderID;

    const db_file = await this.fileService.create(
      createFileDto,
      storedFile,
      tokenPayload,
    );

    const fileDetails: FileProps = {
      folderDriveId,
      localPath: storedFile.path,
      filename: storedFile.filename,
      mimetype: storedFile.mimetype,
      originalname: storedFile.originalname,
      afterUpload: {
        functionCall: UtilsAfterJobFunctionEnum.updateFilePathAfterUpload,
        data: { fileVersionId: db_file.FileVersion[db_file.FileVersion.length-1].id },
      },
    };

    this.googleDriveQueue.add('upload-file', fileDetails, {
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
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
