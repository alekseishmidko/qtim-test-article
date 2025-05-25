import { NotNullableString } from '../../utils/decorators/not-nullable-string.decorator';

export class RegisterUserDto {
  @NotNullableString('admin')
  username: string;

  @NotNullableString('12345678')
  password: string;
}
