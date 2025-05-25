import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseTokenGuard, RequestWithUser } from './base-token.guard';
import { JwtTokenService, TokensTypes } from '../utils/jwt/jwt-token.service';
import { UserQueryRepository } from '../user/repositories/user.query-repository';

@Injectable()
export class AccessTokenGuard extends BaseTokenGuard implements CanActivate {
  constructor(
    protected readonly tokensService: JwtTokenService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {
    super(tokensService, userQueryRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException('You need to provide access token');
    }

    const [bearer, accessTokenWithoutBearer] = accessToken.split(' ');

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid access token. Not found "Bearer" in authorization headers',
      );
    }

    await this.verifyTokenAndAddUserToRequest(req, {
      token: accessTokenWithoutBearer,
      tokenType: TokensTypes.ACCESS_TOKEN,
    });

    return true;
  }
}
