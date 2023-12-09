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

@Injectable()
export class FileService {
  constructor(
    // private myConfigService: MyConfigService,
    private prisma: PrismaService,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    file: fileInterface,
    tokenPayload: TokenPayloadProps,
  ) {
    const file_ = await this.prisma.file.create({
      data: {
        extension: file.mimetype,
        name: createFileDto.name,
        folder_id: +createFileDto.folder_id,
        checked_in: false,
        FileVersion: {
          create: {
            user_id: tokenPayload.user.id,
            name: createFileDto.name,
            path: file.path,
            size: file.size,
            extension: file.mimetype,
          },
        },
      },
      include: {
        FileVersion: true,
      },
    });
    return file_;
  }

  async findAll(
    { user }: TokenPayloadProps,
    params: QueryParamsInterface,
    folder_id: number,
  ) {
    const userExistsInFolder = await this.prisma.userFolder.findFirst({
      where: {
        folder_id,
        user_id: user.id,
      },
    });
    if (userExistsInFolder == null) {
      throw new UnauthorizedException(
        'unauthorize action , you do not have access for this folder',
      );
    }
    log(params);
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

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
