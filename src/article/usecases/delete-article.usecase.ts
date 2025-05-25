import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArticleRepository } from '../repositories/article.repository';
import { ArticleQueryRepository } from '../repositories/article.query-repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { articleErrorMessages } from '../constants';
import { ArticleCacheRepository } from '../repositories/article.cache-repository';

export class DeleteArticleCommand {
  constructor(
    public articleId: number,
    public userId: number,
  ) {}
}

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleUsecase
  implements ICommandHandler<DeleteArticleCommand, void>
{
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly articleCacheRepository: ArticleCacheRepository,
  ) {}

  async execute({ articleId, userId }: DeleteArticleCommand): Promise<void> {
    const foundArticleById =
      await this.articleQueryRepository.getArticleById(articleId);

    if (!foundArticleById) {
      throw new NotFoundException(articleErrorMessages.notFoundById);
    }

    if (foundArticleById.author.id !== userId) {
      throw new ForbiddenException(articleErrorMessages.cantDelete);
    }

    await Promise.all([
      this.articleRepository.deleteArticle(articleId),
      this.articleCacheRepository.deleteAllArticles(),
    ]);
  }
}
