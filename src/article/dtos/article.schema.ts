import { ArticleAuthorSchema } from './article-author.schema';
import { ApiProperty } from '@nestjs/swagger';

export class ArticleSchema {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'qwerty',
  })
  title: string;

  @ApiProperty({
    example: 'turn geese into swans',
  })
  description: string;

  @ApiProperty({
    example: '2025-05-23T00:00:00.000Z',
  })
  publishedAt: string;

  @ApiProperty({
    example: '2025-05-23T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-05-23T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty()
  author: ArticleAuthorSchema;
}
