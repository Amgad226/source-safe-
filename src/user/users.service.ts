import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  public users: any;

  constructor(private prisma: PrismaService, private redis: RedisService) {
    this.users = [
      {
        userId: 1,
        username: 'amgad',
        password: 'amgad123',
      },
      {
        userId: 2,
        username: 'ayham',
        password: 'amgad123',
      },
    ];
  }

  async user() {
    this.redis.addToBlacklist('e12ee12qwedwkcabweye1x');
    let usersFromDatabase = await this.prisma.user.findMany();
    return UserEntity.collect(usersFromDatabase);
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

  async findOne(username) {
    return this.users.find((user) => user.username === username);
  }
}
