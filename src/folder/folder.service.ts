import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Folder, Prisma } from '@prisma/client';
import { PaginatorEntity } from 'src/base-module/pagination/paginator.entity';
import { PaginatorHelper } from 'src/base-module/pagination/paginator.helper';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { MyConfigService } from 'src/my-config/my-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddUsersDto } from './dto/add-users.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderEntity } from './entities/folder.entity';

@Injectable()
export class FolderService {
  constructor(
    private myConfigService: MyConfigService,
    private googleDrive: GoogleDriveService,
    private prisma: PrismaService,
  ) {}

  async create(
    { name, parentFolderIdDb },
    logoLocalPath:string,
    tokenPayload: TokenPayloadProps,
  ) {
    const admin_folder_role = await this.prisma.folderRole.findFirst({
      where: {
        name: 'admin',
      },
      select: {
        id: true,
      },
    });
    const folder = await this.prisma.folder.create({
      data: {
        logo: logoLocalPath,
        name,
        parentFolder: {
          connect: { id: parentFolderIdDb },
        },
      },
    });
    await this.prisma.userFolder.create({
      data: {
        folder_id: folder.id,
        folder_role_id: admin_folder_role.id,
        user_id: tokenPayload.user.id,
      },
    });
    return folder;
  }
  public async getParentFolderDriveIds(
    parentFolderId: number | string,
  ): Promise<{ DriveFolderId: string; DbFolderId: number }> {
    let drive_folderId = '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw';
    let rootDbFolderId = await this.prisma.folder.findFirst({
      where: { name: 'root folder', driveFolderID: drive_folderId },
      select: { id: true },
    });
    let DbFolderId = rootDbFolderId.id;
    if (parentFolderId != null) {
      const folder_db = await this.resolveParentFolderId(parentFolderId);
      drive_folderId = folder_db.driveFolderID;
      DbFolderId = folder_db.id;
    }
    return {
      DriveFolderId: drive_folderId,
      DbFolderId: DbFolderId,
    };
  }
  private async resolveParentFolderId(
    parentFolderId: number | string,
  ): Promise<Folder> {
    if (typeof parentFolderId !== 'number') {
      parentFolderId = parseInt(parentFolderId, 10);
    }

    if (isNaN(parentFolderId) || !Number.isSafeInteger(parentFolderId)) {
      throw new UnprocessableEntityException('parentFolderId must be a number');
    }

    const parentDbFolder = await this.prisma.folder.findFirst({
      where: { id: parentFolderId },
    });

    if (!parentDbFolder) {
      throw new NotFoundException('parentFolderId invalid');
    }

    return parentDbFolder;
  }
  async findAll({ user }: TokenPayloadProps, params: QueryParamsInterface) {
    const folders = await PaginatorHelper<Prisma.FolderFindManyArgs>({
      model: this.prisma.folder,
      ...params,
      relations: {
        where: {
          UserFolder: {
            some: {
              user_id: {
                equals: user.id,
              },
            },
          },
        },
      },
    });
    return new PaginatorEntity(FolderEntity, folders);
  }

  async findOne(id: number, { user }: TokenPayloadProps) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    const checkIfHasPermission = await this.prisma.userFolder.findFirst({
      where: {
        folder_id: id,
        user_id: user.id,
      },
    });
    if (checkIfHasPermission == null) {
      throw new ForbiddenException('you cant seed this folder info');
    }
    return `This action returns a #${id} folder`;
  }

  async addUsers(id: number, { users_ids }: AddUsersDto) {
    const folder_user_role = await this.prisma.folderRole.findFirst({
      where: {
        name: 'user',
      },
      select: {
        id: true,
      },
    });

    if (!folder_user_role) {
      throw new NotFoundException('Folder role "user" not found');
    }

    // Create userFolder entries for the specified users_ids
    const userFolderData = await Promise.all(
      users_ids.map(async (user_id) => {
        const userFolderExist = await this.prisma.userFolder.findFirst({
          where: {
            folder_id: id,
            user_id,
          },
          select: {
            id: true,
          },
        });
        if (userFolderExist) {
          return null;
        }

        const userFolderRequestExist =
          await this.prisma.userFolderRequest.findFirst({
            where: {
              folder_id: id,
              user_id,
            },
            select: {
              id: true,
            },
          });

        if (userFolderRequestExist) {
          return null;
        }
        return {
          folder_id: id,
          user_id,
        };
      }),
    );

    // Filter out null values
    const filteredUserFolderData = userFolderData.filter(Boolean);

    // Now, filteredUserFolderData contains the desired result

    return (
      await this.prisma.userFolderRequest.createMany({
        data: filteredUserFolderData,
      })
    ).count;
  }

  update(id: number, updateFolderDto: UpdateFolderDto) {
    return `This action updates a #${id} folder`;
  }

  remove(id: number) {
    return `This action removes a #${id} folder`;
  }
}
