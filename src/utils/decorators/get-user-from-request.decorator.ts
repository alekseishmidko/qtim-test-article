import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../guards/base-token.guard';

export const GetUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    return req?.user;
  },
);
