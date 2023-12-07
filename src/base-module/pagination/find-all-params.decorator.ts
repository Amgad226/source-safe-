import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const FindAllParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      search: request.query.search,
      page: parseInt(request.query.page, 10) || 1,
      items_per_page: parseInt(request.query.items_per_page, 10) || 10,
    };
  },
);
