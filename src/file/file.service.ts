import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { MyConfigService } from 'src/my-config/my-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { fileInterface } from 'src/base-module/upload-file.helper';

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

  findAll() {
    return `This action returns all file`;
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
