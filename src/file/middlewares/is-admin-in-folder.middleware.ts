import {
    Injectable,
    NestMiddleware,
    UnauthorizedException
} from '@nestjs/common';
import { log } from 'console';
import { NextFunction, Request, Response } from 'express';
import * as multer from 'multer';
import { PrismaService } from 'src/prisma/prisma.service';
const upload = multer();

@Injectable()
export class IsAdminInFolder implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    log('IsAdminInFolder')
    next();
    upload.any()(req, res, async (err) => {
      if (err) {
        // Handle multer error
        return log(err);
      }
      const folderId = req.body.folder_id; // Assuming 'folder_id' is the key in form data

      // Continue with the middleware logic
      // ...
      const user = req['user'];

      log(folderId, user);
      next();

      const adminFolderRole = await this.prisma.folderRole.findFirst({
        where: { name: 'admin' },
      });
      const folder = await this.prisma.folder.findFirst({
        where: {
          id: +folderId,
          UserFolder: {
            some: {
              folder_role_id: adminFolderRole.id,
              user_id: user.id,
            },
          },
        },
      });
      if (!folder) {
        throw new UnauthorizedException('unauthorized');
      }

      next();
    });
  }
}
