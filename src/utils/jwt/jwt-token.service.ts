import { Inject, Injectable } from '@nestjs/common';
import appConfig from '../../config/app.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { add, getUnixTime } from 'date-fns';
import { Response } from 'express';

export interface JwtTokenPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface TokensPairSchema {
  accessToken: string;
  refreshToken: string;
}

export enum TokensTypes {
  ACCESS_TOKEN = 'access',
  REFRESH_TOKEN = 'refresh',
}

@Injectable()
export class JwtTokenService {
  public static readonly REFRESH_TOKEN = 'refreshToken';

  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  private readonly getAccessTokenExpireTime: (currentDate: Date) => number;
  private readonly getRefreshTokenExpireTime: (currentDate: Date) => number;

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.config.accessTokenSecret!;
    this.refreshTokenSecret = this.config.refreshTokenSecret!;

    this.getAccessTokenExpireTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { hours: 1 }));
    };
    this.getRefreshTokenExpireTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { months: 1 }));
    };
  }

  private async createToken(
    data: { userId: number; username: string },
    tokenType: TokensTypes,
  ) {
    const { userId, username } = data;

    const currentDate: Date = new Date();

    // in seconds
    const iat: number = getUnixTime(currentDate);

    let exp: number;
    let secret: string;

    switch (tokenType) {
      case TokensTypes.ACCESS_TOKEN:
        exp = this.getAccessTokenExpireTime(currentDate);
        secret = this.accessTokenSecret;
        break;
      case TokensTypes.REFRESH_TOKEN:
        exp = this.getRefreshTokenExpireTime(currentDate);
        secret = this.refreshTokenSecret;
    }

    const payload: JwtTokenPayload = {
      userId,
      username,
      iat,
      exp,
    };

    return this.jwtService.signAsync(payload, {
      secret,
    });
  }

  async createAccessToken(data: { userId: number; username: string }) {
    return this.createToken(data, TokensTypes.ACCESS_TOKEN);
  }

  async createRefreshToken(data: { userId: number; username: string }) {
    return this.createToken(data, TokensTypes.REFRESH_TOKEN);
  }

  setRefreshTokenInCookie(data: { refreshToken: string; res: Response }): void {
    const { refreshToken, res } = data;

    res.cookie(JwtTokenService.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }

  async createTokensPair(data: {
    userId: number;
    username: string;
  }): Promise<TokensPairSchema> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(data),
      this.createRefreshToken(data),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getTokenPayload(token: string): JwtTokenPayload {
    return this.jwtService.decode(token);
  }

  private async verifyToken(
    token: string,
    tokenType: TokensTypes,
  ): Promise<JwtTokenPayload | null> {
    const secret =
      tokenType === TokensTypes.ACCESS_TOKEN
        ? this.accessTokenSecret
        : this.refreshTokenSecret;

    try {
      const tokenPayload: JwtTokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret,
          ignoreExpiration: false,
        },
      );

      return tokenPayload;
    } catch (err) {
      console.error(`error_verify_token ${JSON.stringify(err)}`);
      return null;
    }
  }

  async verifyAccessToken(token: string): Promise<JwtTokenPayload | null> {
    return this.verifyToken(token, TokensTypes.ACCESS_TOKEN);
  }

  async verifyRefreshToken(token: string): Promise<JwtTokenPayload | null> {
    return this.verifyToken(token, TokensTypes.REFRESH_TOKEN);
  }
}
