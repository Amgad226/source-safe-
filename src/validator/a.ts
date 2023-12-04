import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadProps } from 'src/base-module/token-payload-interface';

const prisma = new PrismaClient();

export const ExistsInDatabase = (prismaName: string) => {
  return createParamDecorator(async (value: string, ctx: ExecutionContext) => {
    const [req] = ctx.getArgs();
    const id = +value;
    const s = await prisma[prismaName].findFirst({
      where: {
        id: +id,
      },
    });

    if (!s) {
      throw new NotFoundException(`${prismaName} not found`);
    }
  });
};
