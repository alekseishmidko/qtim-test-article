import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from './usecases/register-user.usecase';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginUserSchema } from './dtos/login-user.schema';
import {
  TokensPairSchema,
  JwtTokenService,
} from '../utils/jwt/jwt-token.service';
import { Response } from 'express';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';

import { GetUserFromRequest } from 'src/utils/decorators/get-user-from-request.decorator';
import { UserEntity } from './user.entity';
import {
  LoginUserCommand,
  unauthorizedExceptionDesc,
} from './usecases/login-user.usecase';

@Controller('user')
@ApiTags('user')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtTokensService: JwtTokenService,
  ) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'User register' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Success registration',
  })
  @ApiConflictResponse({
    description: 'Username already taken',
  })
  async register(@Body() dto: RegisterUserDto) {
    await this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'User login' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success login',
    type: LoginUserSchema,
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedExceptionDesc,
  })
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserSchema> {
    const tokensPair: TokensPairSchema = await this.commandBus.execute(
      new LoginUserCommand(dto),
    );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensPair.refreshToken,
      res,
    });

    return {
      accessToken: tokensPair.accessToken,
    };
  }

  @Put('generate-tokens')
  @ApiOperation({ summary: 'Update tokens ' })
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The tokens  successfully updated',
    type: LoginUserSchema,
  })
  @ApiUnauthorizedResponse()
  @ApiCookieAuth()
  async updateTokens(
    @GetUserFromRequest() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserSchema> {
    const newTokensPair: TokensPairSchema =
      await this.jwtTokensService.createTokensPair({
        userId: user.id,
        username: user.username,
      });

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: newTokensPair.refreshToken,
      res,
    });

    return {
      accessToken: newTokensPair.accessToken,
    };
  }
}
