import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request, Response, NextFunction } from 'express';
import { log } from 'console';

@Injectable()
export class CheckFolderAndUsersMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const folderId = +req.params['id']; // Use square brackets to access dynamic parameters
    const { users_ids } = req.body as { users_ids: number[] };

    log(users_ids);
    if (!users_ids.every((id) => typeof id === 'number')) {
      throw new BadRequestException('Invalid user ID(s) in the array');
    }
    const folder = await this.prismaService.folder.findFirst({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Check if all user IDs exist
    const usersExistCount = await this.prismaService.user.count({
      where: {
        id: {
          in: users_ids,
        },
      },
    });

    if (users_ids.length !== usersExistCount) {
      throw new NotFoundException("Number of not found users in the users_ids array is"+" " +(users_ids.length-usersExistCount));
    }

    next();
  }
}
