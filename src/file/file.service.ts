import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatorEntity } from 'src/base-module/pagination/paginator.entity';
import { PaginatorHelper } from 'src/base-module/pagination/paginator.helper';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import {
  TokenPayloadType,
  UserTokenPayloadType,
} from 'src/base-module/token-payload-interface';
import { fileInterface } from 'src/base-module/upload-file.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileEntity } from './entities/file.entity';
import { log } from 'console';
import { FolderHelperService } from 'src/folder/folder.helper.service';
import { FileStatusEnum } from './enums/file-status.enum';
import { formatTimestamp } from 'src/base-module/helpers';

@Injectable()
export class FileService {
  constructor(
    // private myConfigService: MyConfigService,
    private prisma: PrismaService,
  ) {}

  async create(
    { folder_id, name }: CreateFileDto,
    file: fileInterface,
    tokenPayload: TokenPayloadType,
  ) {
    const file_ = await this.prisma.file.create({
      data: {
        extension: file.mimetype,
        name: name,
        folder_id: +folder_id,
        status: FileStatusEnum.PROCESSING,
        FileVersion: {
          create: {
            user_id: tokenPayload.user.id,
            name: name,
            path: file.path,
            size: file.size,
            extension: file.mimetype,
          },
        },
      },
      include: {
        FileVersion: true,
        Folder: true,
      },
    });
    return new FileEntity(file_);
  }

  async findAll(params: QueryParamsInterface, folder_id: number) {
    const files = await PaginatorHelper<Prisma.FileFindManyArgs>({
      model: this.prisma.file,
      ...params,
      relations: {
        where: {
          deleted_at: null,
          folder_id,
        },
        include: {
          FileVersion: {
            include: {
              User: true,
            },
          },
        },
      },
    });
    files.data.map((file) => {
      file['full_size'] = file.FileVersion.reduce((accumulator, version) => {
        return version.size + accumulator;
      }, 0);
      file['latest_size'] =
        file.FileVersion[file.FileVersion.length - 1]?.size ?? 'not_found_data';
    });
    return new PaginatorEntity(FileEntity, files);
  }
  async removedFiles(params, tokenPayload: TokenPayloadType) {
    console.log(tokenPayload.user.id);
    const admin_folder_role = await this.prisma.folderRole.findFirst({
      where: {
        name: 'admin',
      },
      select: {
        id: true,
      },
    });
    const files = await PaginatorHelper<Prisma.FileFindManyArgs>({
      model: this.prisma.file,
      ...params,
      relations: {
        where: {
          NOT: {
            deleted_at: null,
          },
          Folder: {
            UserFolder: {
              every: {
                folder_role_id: admin_folder_role.id,
                user_id: tokenPayload.user.id,
              },
            },
          },
        },
        include: {
          FileVersion: {
            include: {
              User: true,
            },
          },
        },
      },
    });
    files.data.map((file) => {
      file['full_size'] = file.FileVersion.reduce((accumulator, version) => {
        return version.size + accumulator;
      }, 0);
      file['latest_size'] =
        file.FileVersion[file.FileVersion.length - 1]?.size ?? 'not_found_data';
    });
    return new PaginatorEntity(FileEntity, files);
  }

  async checkInByMe(user: UserTokenPayloadType) {
    const files = await PaginatorHelper<Prisma.FileFindManyArgs>({
      model: this.prisma.file,
      relations: {
        where: {
          deleted_at: null,

          Folder: {
            UserFolder: {
              every: {
                user_id: user.id,
              },
            },
          },
        },
        include: {
          FileVersion: {
            include: {
              User: true,
            },
          },
          Folder:{
            include:{
              UserFolder:true
            }
          }
        },
      },
    });
    files.data.map((file) => {
      file['full_size'] = file.FileVersion.reduce((accumulator, version) => {
        return version.size + accumulator;
      }, 0);
      file['latest_size'] =
        file.FileVersion[file.FileVersion.length - 1]?.size ?? 'not_found_data';
    });
    return new PaginatorEntity(FileEntity, files);
  }

  async findOne(id: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        FileVersion: { include: { User: true } },
        Folder: true,
      },
    });
    if (file == null) {
      throw new NotFoundException('file not found or may deleted by admin');
    }
    file['full_size'] = file.FileVersion.reduce((accumulator, version) => {
      return version.size + accumulator;
    }, 0);
    file['latest_size'] =
      file.FileVersion[file.FileVersion.length - 1]?.size ?? 'not_found_data';

    return new FileEntity(file);
  }

  async findOneForCheckout(id: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        Folder: true
      },
    });
    return file;
    
 
  }

  async fileChangeStatus(
    id: number,
    user: UserTokenPayloadType,
    status: FileStatusEnum,
    text?: string,
  ) {
    await this.prisma.file.update({
      where: {
        id,
      },
      data: {
        status: status,
      },
    });
    const last_version_file = await this.prisma.fileVersion.findFirst({
      where: {
        file_id: id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    await this.prisma.fileStatistic.create({
      data: {
        status: status,
        user_id: user.id,
        file_version_id: last_version_file.id,
        text: `${text} this file has ${status} at ${formatTimestamp(
          Date.now(),
        )}😁`,
        file_id: id,
      },
    });
  }
  async storeCheckIn(file_id: number, user: UserTokenPayloadType) {
    const check_in = await this.prisma.checkIn.create({
      data: {
        user_id: user.id,
        file_id,
      },
    });
  }
  async deleteCheckIn(file_id: number, user: UserTokenPayloadType) {
    await this.prisma.checkIn.deleteMany({
      where: {
        user_id: user.id,
        file_id,
      },
    });
  }
  async checkedInByAuthUser(file_id: number, user: UserTokenPayloadType) {
    const checkIn = await this.prisma.checkIn.findFirst({
      where: {
        file_id,
        user_id: user.id,
      },
    });
    return checkIn != null ? true : false;
  }

  async createVersion(
    file_id: number,
    user: UserTokenPayloadType,
    {
      destination,
      encoding,
      fieldname,
      filename,
      mimetype,
      originalname,
      path,
      size,
    }: fileInterface,
  ) {
    return await this.prisma.fileVersion.create({
      data: {
        extension: mimetype,
        name: filename,
        path,
        size,
        file_id,
        user_id: user.id,
      },
    });
  }
  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  async remove(id: number) {
    await this.prisma.file.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async restore(id: number) {
    await this.prisma.file.update({
      where: { id },
      data: { deleted_at: null },
    });
  }
}
