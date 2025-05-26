import { LoginUserDto } from '../dtos/login-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../repositories/user.query-repository';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  TokensPairSchema,
  JwtTokenService,
} from '../../utils/jwt/jwt-token.service';

export const unauthorizedRes = 'Username or password is not valid';

export class LoginUserCommand {
  constructor(public data: LoginUserDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUsecase
  implements ICommandHandler<LoginUserCommand, TokensPairSchema>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly jwtTokensService: JwtTokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<TokensPairSchema> {
    const foundUser = await this.getUser(command);

    return this.jwtTokensService.createTokensPair({
      username: foundUser.username,
      userId: foundUser.id,
    });
  }

  async getUser({ data }: LoginUserCommand) {
    const foundUserByUsername =
      await this.userQueryRepository.getUserByUsername(data.username);

    if (!foundUserByUsername) {
      throw new UnauthorizedException(unauthorizedRes);
    }

    let passwordIsCorrect: boolean;

    try {
      passwordIsCorrect = await argon2.verify(
        foundUserByUsername.password,
        data.password,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      passwordIsCorrect = false;
    }

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(unauthorizedRes);
    }

    return foundUserByUsername;
  }
}
