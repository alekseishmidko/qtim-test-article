import { NotNullableString } from '../../utils/decorators/not-nullable-string.decorator';

export class CreateArticleDto {
  @NotNullableString('qwerty')
  title: string;

  @NotNullableString('turn geese into swans')
  description: string;
}
