import {
  BadRequestException,
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
import { collectDataBy } from 'src/base-module/base-entity';

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
    const userExistsInFolder = await this.prisma.userFolder.findFirst({
      where: {
        folder_id:+folder_id,
        user_id: tokenPayload.user.id,
      },
    });
    const FolderRole = await this.prisma.folderRole.findFirst({
      where: { id: userExistsInFolder.folder_role_id },
    });

    const file_ = await this.prisma.file.create({
      data: {
        hide: FolderRole.name == 'user' ? true : false,
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

  async findAll(
    params: QueryParamsInterface,
    folder_id: number,
    hide: boolean,
  ) {
    const files = await PaginatorHelper<Prisma.FileFindManyArgs>({
      model: this.prisma.file,
      ...params,
      relations: {
        orderBy: { created_at: 'desc' },
        where: {
          deleted_at: null,
          folder_id,
          hide: hide,
        },
        include: {
          FileVersion: {
            orderBy: { created_at: 'desc' },
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
  async recentActivities(user: UserTokenPayloadType, limit: number) {
    const files = await this.prisma.file.findMany({
      where: {
        Folder: {
          UserFolder: {
            some: {
              user_id: user.id,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      include: {
        FileVersion: {
          orderBy: { created_at: 'desc' },
          include: {
            User: true,
          },
        },
        Folder: {
          include: {
            UserFolder: {
              orderBy: { id: 'asc' },
              take: 1,
              include: {
                folder_role: true,
                user: true,
              },
            },
          },
        },
      },
      take: limit,
    });
    return collectDataBy(FileEntity, files);
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
              some: {
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
          Folder: true,
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

  async checkInByMe(user: UserTokenPayloadType, params: QueryParamsInterface) {
    const files = await PaginatorHelper<Prisma.FileFindManyArgs>({
      model: this.prisma.file,
      ...params,
      relations: {
        orderBy: { created_at: 'desc' },
        where: {
          CheckIn: {
            some: {
              user_id: user.id,
            },
          },
        },
        include: {
          FileVersion: {
            orderBy: { created_at: 'desc' },
            include: {
              User: true,
            },
          },
          Folder: {
            include: {
              UserFolder: true,
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
  async fileRequestHandle(file_id: number, status: boolean) {
    if (status == true) {
      await this.prisma.file.update({
        where: {
          id: file_id,
        },
        data: {
          hide: false,
        },
      });
    } else {
      await this.prisma.file.delete({
        where: { id: file_id },
      });
    }
  }
  async findOne(id: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        deleted_at: null,
        hide: false,
      },
      include: {
        FileVersion: {
          orderBy: { created_at: 'desc' },
          include: { User: true },
        },
        Folder: true,
        FileStatistic: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
          include: {
            user: true,
          },
        },
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
    //TODO must remove this code and re fix them
    if (file.FileStatistic.length > 0) {
      if (file.FileStatistic[0].status == 'processing') {
        file.FileStatistic[0].status = 'check_out';
      }
    }
    return new FileEntity(file);
  }

  async getFileById(id: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        Folder: true,
      },
    });
    if (file == null) {
      throw new NotFoundException(
        `file ${id} not found or may deleted by admin `,
      );
    }
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
    version_name: string,
  ) {
    return await this.prisma.fileVersion.create({
      data: {
        extension: mimetype,
        name: version_name ?? filename,
        path,
        size,
        file_id,
        user_id: user.id,
      },
    });
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
