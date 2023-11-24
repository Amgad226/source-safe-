import { Controller, Get } from '@nestjs/common';
import { UserEntity } from 'src/auth/entities/common/user-entity';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { ResponseInterface } from 'src/base-module/response.interface';
import { Public } from 'src/decorators/public.decorators';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController extends BaseModuleController {
  constructor(private userService: UsersService) {
    super();
  }

  @Public()
  @Get('user')
  async user(): Promise<ResponseInterface<UserEntity>> {
    const user = await this.userService.user();
    return this.returnResponse({ data: user });
  }
}
