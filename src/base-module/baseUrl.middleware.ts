import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BaseUrlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Store the base URL in a global variable (you can use a more sophisticated configuration mechanism)
    global.baseUrl = `${req.protocol}://${req.get('host')}`;

    // Continue processing the request
    next();
  }
}
