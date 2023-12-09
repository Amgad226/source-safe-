import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatorEntity } from 'src/base-module/pagination/paginator.entity';
import { PaginatorHelper } from 'src/base-module/pagination/paginator.helper';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { fileInterface } from 'src/base-module/upload-file.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileEntity } from './entities/file.entity';
import { log } from 'console';
import { FolderHelperService } from 'src/folder/folder.helper.service';

@Injectable()
export class FileService {
  constructor(
    // private myConfigService: MyConfigService,
    private prisma: PrismaService,
  ) {}

  async create(
    { folder_id, name }: CreateFileDto,
    file: fileInterface,
    tokenPayload: TokenPayloadProps,
  ) {
    const file_ = await this.prisma.file.create({
      data: {
        extension: file.mimetype,
        name: name,
        folder_id: +folder_id,
        checked_in: false,
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
  ) {
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

    return new PaginatorEntity(FileEntity, files);
  }

  async findOne(id: number) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
      },
      include: {
        FileVersion: { include: { User: true } },
      },
    });
    return new FileEntity(file);
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
