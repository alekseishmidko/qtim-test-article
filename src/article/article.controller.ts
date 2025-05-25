import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../guards/access-token.guard';

import { UserEntity } from '../user/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { articleErrorMessages, articleResponseMessages } from './constants';
import { UpdateArticleCommand } from './usecases/update-article.usecase';
import { DeleteArticleCommand } from './usecases/delete-article.usecase';
import { CreateArticleCommand } from './usecases/create-article.usecase';
import { GetArticlesSchema } from './dtos/get-articles.schema';
import { GetArticlesDto } from './dtos/get-articles.dto';
import { GetArticlesQuery } from './usecases/get-articles.usecase';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { CreateArticleDto } from './dtos/create-article.dto';
import { ArticleSchema } from './dtos/article.schema';
import { GetUserFromRequest } from 'src/utils/decorators/get-user-from-request.decorator';

const ProtectedEndpoint = (apiOperation: string, httpStatus: HttpStatus) => {
  return applyDecorators(
    ApiOperation({
      summary: apiOperation,
    }),
    UseGuards(AccessTokenGuard),
    ApiUnauthorizedResponse(),
    ApiBearerAuth(),
    HttpCode(httpStatus),
  );
};

@Controller('/article')
@ApiTags('article')
export class ArticleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ProtectedEndpoint('Create new article', HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: articleResponseMessages.created,
    type: ArticleSchema,
  })
  async createArticle(
    @Body() dto: CreateArticleDto,
    @GetUserFromRequest() user: UserEntity,
  ): Promise<ArticleSchema> {
    return this.commandBus.execute(
      new CreateArticleCommand({
        ...dto,
        authorId: user.id,
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get articles' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: GetArticlesSchema,
  })
  async getArticles(@Query() dto: GetArticlesDto): Promise<GetArticlesSchema> {
    return this.queryBus.execute(new GetArticlesQuery(dto));
  }

  @Patch('/:articleId')
  @ProtectedEndpoint('Create new article', HttpStatus.OK)
  @ApiOkResponse({
    description: articleResponseMessages.updated,
    type: ArticleSchema,
  })
  @ApiNotFoundResponse({
    description: articleErrorMessages.notFoundById,
  })
  @ApiForbiddenResponse({
    description: articleErrorMessages.cantEdit,
  })
  async updateArticle(
    @Param('articleId') articleId: number,
    @Body() dto: UpdateArticleDto,
    @GetUserFromRequest() user: UserEntity,
  ): Promise<ArticleSchema> {
    return this.commandBus.execute(
      new UpdateArticleCommand(articleId, user.id, dto),
    );
  }

  @Delete('/:articleId')
  @ProtectedEndpoint('Delete article', HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: articleResponseMessages.deleted })
  @ApiNotFoundResponse({
    description: articleErrorMessages.notFoundById,
  })
  @ApiForbiddenResponse({
    description: articleErrorMessages.cantDelete,
  })
  async deleteArticle(
    @Param('articleId') articleId: number,
    @GetUserFromRequest() user: UserEntity,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteArticleCommand(articleId, user.id));
  }
}
