import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { ResponseInterface } from 'src/base-module/response.interface';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';
import { TokenPayload } from 'src/decorators/user-decorator';
import { UsersService } from './users.service';

@Controller()
export class UsersController extends BaseModuleController {
  constructor(private userService: UsersService) {
    super();
  }

  @Get('users')
  async user(): Promise<ResponseInterface<UserEntity>> {
    const user = await this.userService.users();
    return this.successResponse({ data: user });
  }

  @Get('users/not-in-folder/:folder_id')
  async usersNotInFolder(
    @Param('folder_id') folder_id: string,
  ): Promise<ResponseInterface<UserEntity>> {
    const user = await this.userService.usersNotInFolder(+folder_id);
    return this.successResponse({ data: user });
  }

  @Get('my-folder-requests')
  async folderRequest(
    @TokenPayload() tokenPayload: TokenPayloadProps,
  ): Promise<ResponseInterface> {
    const folderRequest = await this.userService.folderRequest(tokenPayload);
    return this.successResponse({ data: folderRequest });
  }

  @Post('accept-join-folder/:folder_user_request_id')
  async acceptJoinFolder(
    @TokenPayload() tokenPayload: TokenPayloadProps,
    @Param('folder_user_request_id') folder_user_request_id: string,
  ) {
    await this.userService.acceptJoinFolder(
      +folder_user_request_id,
      tokenPayload,
    );
    return this.successResponse({});
  }

  @Post('reject-join-folder/:folder_user_request_id')
  async rejectJoinFolder(
    @TokenPayload() tokenPayload: TokenPayloadProps,
    @Param('folder_user_request_id') folder_user_request_id: string,
  ) {
    await this.userService.rejectJoinFolder(
      +folder_user_request_id,
      tokenPayload,
    );
    return this.successResponse({});
  }
}
