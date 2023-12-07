import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async users() {
    let users = await this.prisma.user.findMany({});
    return UserEntity.collect(users);
  }

  async usersNotInFolder(folder_id: number) {
    let users = await this.prisma.user.findMany({
      where: {
        UserFolder: {
          every: {
            folder_id,
          },
        },
        UserFolderRequest: {
          every: {
            folder_id,
          },
        },
      },
    });
    return UserEntity.collect(users);
  }

  async folderRequest({ user }: TokenPayloadProps) {
    const foldersRequests = await this.prisma.userFolderRequest.findMany({
      where: {
        user_id: user.id,
      },
    });
    return foldersRequests;
  }

  private async findFolderUserRequestByAuthUser(
    folderUserRequestId: number,
    { user }: TokenPayloadProps,
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
      throw new NotFoundException('Request not found');
    }

    if (folderUserRequest.user_id !== user.id) {
      throw new UnauthorizedException('You cannot perform this action');
    }
    return folderUserRequest;
  }

  async acceptJoinFolder(
    folderUserRequestId: number,
    TokenPayloadProps: TokenPayloadProps,
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
    TokenPayloadProps: TokenPayloadProps,
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
