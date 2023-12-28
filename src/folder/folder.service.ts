import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatorEntity } from 'src/base-module/pagination/paginator.entity';
import { PaginatorHelper } from 'src/base-module/pagination/paginator.helper';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddUsersDto } from './dto/add-users.dto';
import { BaseFolderEntity } from './entities/base-folder.entity';
import { FolderEntity } from './entities/folder.entity';
import { FolderIndexEntity } from './entities/folder-index.entity';
import { RemoveUserDto } from './dto/remove-user.dto';
import { FileEntity } from 'src/file/entities/file.entity';
import { FilterParams } from 'src/base-module/filter.interface';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async create(
    { name, parentFolderIdDb },
    logoLocalPath: string,
    tokenPayload: TokenPayloadType,
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
  async findAll(
    { user }: TokenPayloadType,
    params: QueryParamsInterface,
    filters: FilterParams,
  ) {
    //TODO must improve this and do it with general way 
    let scopes = {};
    const adminRole = await this.prisma.folderRole.findFirst({
      where: {
        name: 'admin',
      },
    });
    if (filters?.myFolders=='true') {
      scopes = {
        folder_role_id: adminRole.id,
      };
    }
    const folders = await PaginatorHelper<Prisma.FolderFindManyArgs>({
      model: this.prisma.folder,
      ...params,
      relations: {
        include: {
          UserFolder: { include: { user: true, folder_role: true } },

          files: {
            include: {
              FileVersion: true,
            },
          },
        },
        where: {
          UserFolder: {
            some: {
              ...scopes,

              user_id: {
                equals: user.id,
              },
            },
          },
        },
      },
    });
    folders.data.map((folder) => {
      folder['folder_size'] = folder.files.reduce((accumulator, file) => {
        const fileVersionSizes = file.FileVersion.map(
          (version) => version.size,
        );
        const totalSizeForFile = fileVersionSizes.reduce(
          (sum, size) => sum + size,
          0,
        );
        return accumulator + totalSizeForFile;
      }, 0);
      folder['files_count'] = folder.files.length;
      return folder;
    });
    return new PaginatorEntity(FolderIndexEntity, folders);
  }

  async findOne(id: number) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        files: { include: { FileVersion: true } },
        UserFolder: { include: { user: true, folder_role: true } },
      },
    });
    // SELECT
    // folders.*,
    // COALESCE(subquery.total_size, 0) AS total_size
    // FROM folders
    // LEFT JOIN
    //          (
    //            SELECT folder_id, SUM(file_versions.size) AS total_size
    //            FROM files
    //            JOIN file_versions ON file_versions.file_id = files.id
    //            GROUP BY folder_id
    //            ) AS subquery ON folders.id = subquery.folder_id;

    const totalSize = folder.files.reduce((accumulator, file) => {
      const fileVersionSizes = file.FileVersion.map((version) => version.size);
      const totalSizeForFile = fileVersionSizes.reduce(
        (sum, size) => sum + size,
        0,
      );
      return accumulator + totalSizeForFile;
    }, 0);
    folder['folder_size'] = totalSize;
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }
    return new FolderEntity(folder);
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

  async deleteUser(id: number, { user_id }: RemoveUserDto) {
    const userFolderExist = await this.prisma.userFolder.findFirst({
      where: {
        folder_id: id,
        user_id,
      },
      select: {
        id: true,
      },
    });
    if (userFolderExist == null) {
      throw new NotFoundException('user not in this group');
    } else {
      await this.prisma.userFolder.delete({
        where: {
          id: userFolderExist.id,
        },
      });
    }
  }
 
}
