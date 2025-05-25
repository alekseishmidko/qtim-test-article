import { ArticleSchema } from './article.schema';
import { ApiProperty } from '@nestjs/swagger';

const articleSample = {
  id: 2,
  title: 'qwerty',
  description: 'turn geese into swans',
  publishedAt: '2025-05-23T00:00:00.000Z',
  createdAt: '2025-05-23T00:00:00.000Z',
  updatedAt: '2025-05-23T00:00:00.000Z',
  author: {
    id: 1,
    username: 'admin',
  },
};

export class GetArticlesSchema {
  @ApiProperty({
    type: [ArticleSchema],
    example: [{ ...articleSample }, { ...articleSample, id: 3 }],
  })
  articles: ArticleSchema[];

  @ApiProperty({
    example: 25,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  pageSize: number;
}
