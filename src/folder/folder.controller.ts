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
  UploadedFile,
  UseInterceptors,
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
  ) {
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

    return 'file uploaded successfully ';
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
