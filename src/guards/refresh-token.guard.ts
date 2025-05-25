import { JwtTokenService, TokensTypes } from '../utils/jwt/jwt-token.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserQueryRepository } from '../user/repositories/user.query-repository';
import { BaseTokenGuard, RequestWithUser } from './base-token.guard';

@Injectable()
export class RefreshTokenGuard extends BaseTokenGuard implements CanActivate {
  constructor(
    protected readonly tokensService: JwtTokenService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {
    super(tokensService, userQueryRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const refreshToken: string = req.cookies?.[JwtTokenService.REFRESH_TOKEN];

    await this.verifyTokenAndAddUserToRequest(req, {
      token: refreshToken,
      tokenType: TokensTypes.REFRESH_TOKEN,
    });

    return true;
  }
}
