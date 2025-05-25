import {
  JwtTokenPayload,
  JwtTokenService,
  TokensTypes,
} from '../utils/jwt/jwt-token.service';
import { Request } from 'express';

import { UnauthorizedException } from '@nestjs/common';

import { UserQueryRepository } from '../user/repositories/user.query-repository';
import { UserEntity } from 'src/user/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity;
}

export interface TokenData {
  token: string;
  tokenType: TokensTypes;
}

export class BaseTokenGuard {
  constructor(
    protected readonly tokensService: JwtTokenService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {}

  private async verifyTokenAndGetPayload({
    token,
    tokenType,
  }: TokenData): Promise<JwtTokenPayload> {
    if (!token) {
      throw new UnauthorizedException(`You need to provide ${tokenType} token`);
    }

    const tokenPayload: JwtTokenPayload | null =
      tokenType === TokensTypes.ACCESS_TOKEN
        ? await this.tokensService.verifyAccessToken(token)
        : await this.tokensService.verifyRefreshToken(token);

    if (!tokenPayload) {
      throw new UnauthorizedException(`Invalid ${tokenType} token or expired`);
    }

    return tokenPayload;
  }

  private async getUserByUsername(username: string): Promise<UserEntity> {
    const foundUser =
      await this.userQueryRepository.getUserByUsername(username);

    if (!foundUser) {
      throw new UnauthorizedException('Not found user with provided token');
    }

    return foundUser;
  }

  async verifyTokenAndAddUserToRequest(
    req: RequestWithUser,
    tokenData: TokenData,
  ): Promise<void> {
    const tokenPayload: JwtTokenPayload =
      await this.verifyTokenAndGetPayload(tokenData);

    const foundUser: UserEntity = await this.getUserByUsername(
      tokenPayload.username,
    );

    req.user = foundUser;
  }
}
