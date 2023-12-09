import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import { PaginatorHelper } from 'src/base-module/pagination/paginator.helper';
import { PaginatorEntity } from 'src/base-module/pagination/paginator.entity';
import { QueryParamsInterface } from 'src/base-module/pagination/paginator.interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { FolderRequestEntity } from './entity/folder-request.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async users(params: QueryParamsInterface) {
    const paginated_user = await PaginatorHelper<Prisma.UserFindManyArgs>({
      model: this.prisma.user,
      ...params,
    });
    return new PaginatorEntity(UserEntity, paginated_user);
  }

  async usersNotInFolder(folder_id: number, params: QueryParamsInterface) {
    const paginated_users = await PaginatorHelper<Prisma.UserFindManyArgs>({
      model: this.prisma.user,
      ...params,
      relations: {
        where: {
          UserFolder: {
            none: {
              folder_id,
            },
          },
          UserFolderRequest: {
            none: {
              folder_id,
            },
          },
        },
      },
    });
    return new PaginatorEntity(UserEntity, paginated_users);
  }

  async folderRequest(
    { user }: TokenPayloadType,
    params: QueryParamsInterface,
  ) {
    const foldersRequests =
      await PaginatorHelper<Prisma.UserFolderRequestFindManyArgs>({
        model: this.prisma.userFolderRequest,
        ...params,
        relations: {
          where: {
            user_id: user.id,
          },
          include: {
            folder: true,
          },
        },
      });
    return new PaginatorEntity(FolderRequestEntity, foldersRequests);
  }

  private async findFolderUserRequestByAuthUser(
    folderUserRequestId: number,
    { user }: TokenPayloadType,
  ) {
    const folderUserRequest = await this.prisma.userFolderRequest.findFirst({
      where: {
        id: folderUserRequestId,
      },
      select: {
        folder_id: true,
        user_id: true,
      },
    });
    if (!folderUserRequest) {
      throw new NotFoundException('Request id not found');
    }

    if (folderUserRequest.user_id !== user.id) {
      throw new UnauthorizedException('You cannot perform this action');
    }
    return folderUserRequest;
  }

  async acceptJoinFolder(
    folderUserRequestId: number,
    TokenPayloadProps: TokenPayloadType,
  ) {
    const folderUserRequest = await this.findFolderUserRequestByAuthUser(
      folderUserRequestId,
      TokenPayloadProps,
    );

    const userFolderRoleId = await this.prisma.folderRole.findFirst({
      where: {
        name: 'user',
      },
      select: {
        id: true,
      },
    });

    await this.prisma.$transaction([
      this.prisma.userFolder.create({
        data: { ...folderUserRequest, folder_role_id: userFolderRoleId.id },
      }),
      this.prisma.userFolderRequest.delete({
        where: {
          id: folderUserRequestId,
          user_id: TokenPayloadProps.user.id,
        },
      }),
    ]);
  }

  async rejectJoinFolder(
    folderUserRequestId: number,
    TokenPayloadProps: TokenPayloadType,
  ) {
    const folderUserRequest = await this.findFolderUserRequestByAuthUser(
      folderUserRequestId,
      TokenPayloadProps,
    );

    await this.prisma.userFolderRequest.delete({
      where: {
        id: folderUserRequestId,
        user_id: TokenPayloadProps.user.id,
      },
    });
  }
}
