import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArticleSchema } from '../dtos/article.schema';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { ArticleRepository } from '../repositories/article.repository';
import { ArticleCacheRepository } from '../repositories/article.cache-repository';

export class CreateArticleCommand {
  constructor(public data: CreateArticleDto & { authorId: number }) {}
}

@CommandHandler(CreateArticleCommand)
export class CreateArticleUsecase
  implements ICommandHandler<CreateArticleCommand, ArticleSchema | null>
{
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleCacheRepository: ArticleCacheRepository,
  ) {}

  async execute({
    data: command,
  }: CreateArticleCommand): Promise<ArticleSchema | null> {
    const [createdArticle] = await Promise.all([
      this.articleRepository.createArticle(command),
      this.articleCacheRepository.deleteAllArticles(),
    ]);

    return createdArticle;
  }
}
