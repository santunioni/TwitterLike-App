import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { createAuthorDTO } from '../authors/authors.controller'
import { AuthorsService, Profile } from '../authors/authors.service'
import type { User } from '../nest/jwt.guard'
import { AuthIsOptional, GetUser, JWTAuthGuard, RequireUser } from '../nest/jwt.guard'
import { Pagination, ZodPagination } from '../nest/pagination'
import { buildUrlToPath } from '../nest/url'
import { ZodBody, ZodQuery } from '../nest/validation.utils'
import { TRPC } from '../trpc/app'
import { ArticleFiltersDTO } from './articles.filters'
import { Article, Dated, Sluged, Tagged } from './articles.models'
import { ArticlesService } from './articles.service'

export const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .describe('The slugified article title')

const title = z.string().describe('The article title. Example: "How to train your dragon"')

const description = z.string().describe('The article description. Example: "Tips and tricks to train your dragon"')

const body = z.string().describe('The article body. Example: "Give it a lot a training and feed it with fish."')

const tags = z.array(z.string()).describe('The article tags. Example: ["dragons", "training"]')

const article = z.object({ title, description, body, tags })

export const CreateArticleDTO = z.object({
  article,
})

type CreateArticleBody = z.infer<typeof CreateArticleDTO>

export const UpdateArticleDTO = z.object({
  article: article.partial(),
})

type UpdateArticleBody = z.infer<typeof UpdateArticleDTO>

@ApiTags('articles')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService, private authorsService: AuthorsService) {}

  @AuthIsOptional()
  @Get('feed')
  async getFeed(@GetUser() user: User | null, @ZodQuery(ZodPagination) pagination: Pagination) {
    const view = this.articlesService.getView(user ? await this.authorsService.getUserAuthorProfile(user) : undefined)
    const articles = await view.getFeed(pagination)
    return {
      articles: articles.map(article => createArticleDTO(article, article.author)),
      links:
        articles.length > 0
          ? {
              next: buildUrlToPath('articles/feed', pagination.getNextPage().toParams()),
            }
          : {},
    }
  }

  @AuthIsOptional()
  @Get()
  async getManyArticles(
    @GetUser() user: User | null,
    @ZodQuery(ArticleFiltersDTO)
    filters: ArticleFiltersDTO,
    @ZodQuery(ZodPagination) pagination: Pagination,
  ) {
    const view = this.articlesService.getView(user ? await this.authorsService.getUserAuthorProfile(user) : undefined)
    const articles = await view.getArticlesByFilters(filters, pagination)
    return {
      articles: articles.map(article => createArticleDTO(article, article.author)),
      links:
        articles.length > 0
          ? {
              next: buildUrlToPath('articles', filters.toParams(), pagination.getNextPage().toParams()),
            }
          : {},
    }
  }

  @AuthIsOptional()
  @Get(':slug')
  async getArticle(@GetUser() user: User | null, @Param('slug') slug: string) {
    const view = this.articlesService.getView(user ? await this.authorsService.getUserAuthorProfile(user) : undefined)
    const article = await view.getArticle(slug)
    return {
      article: createArticleDTO(article, article.author),
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    schema: zodToJsonSchema(CreateArticleDTO) as any,
  })
  @Post()
  async createArticle(
    @RequireUser() user: User,
    @ZodBody(CreateArticleDTO)
    body: CreateArticleBody,
  ) {
    const me = await this.authorsService.getUserAuthorProfile(user)
    const cms = this.articlesService.getCMS(me)
    const article = await cms.createArticle(body.article)
    return {
      article: createArticleDTO(article, me),
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: zodToJsonSchema(UpdateArticleDTO) as any,
  })
  @Put(':slug')
  async updateArticle(
    @RequireUser() user: User,
    @Param('slug') slug: string,
    @ZodBody(UpdateArticleDTO)
    body: UpdateArticleBody,
  ) {
    const me = await this.authorsService.getUserAuthorProfile(user)
    const cms = this.articlesService.getCMS(me)
    const article = await cms.updateArticle(slug, body.article)
    return {
      article: createArticleDTO(article, me),
    }
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticle(@RequireUser() user: User, @Param('slug') slug: string) {
    const me = await this.authorsService.getUserAuthorProfile(user)
    const cms = this.articlesService.getCMS(me)
    await cms.deleteArticle(slug)
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':slug/publication')
  async publishArticle(@RequireUser() user: User, @Param('slug') slug: string) {
    const me = await this.authorsService.getUserAuthorProfile(user)
    const cms = this.articlesService.getCMS(me)
    const article = await cms.publishArticle(slug)
    return {
      article: createArticleDTO(article, me),
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':slug/publication')
  async unpublishArticle(@RequireUser() user: User, @Param('slug') slug: string) {
    const me = await this.authorsService.getUserAuthorProfile(user)
    const cms = this.articlesService.getCMS(me)
    const article = await cms.unpublishArticle(slug)
    return {
      article: createArticleDTO(article, me),
    }
  }
}

function createArticleDTO(article: Article & Dated & Sluged & Tagged, author: Profile, favorited?: boolean) {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    ...(favorited !== undefined ? { favorited } : {}),
    tags: article.tags,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: createAuthorDTO(author),
    links: {
      self: buildUrlToPath(`articles/${article.slug}`),
      author: buildUrlToPath(`profiles/${author.username}`),
      comments: buildUrlToPath(`articles/${article.slug}/comments`),
    },
  } as const
}

export function createArticlesTrpcRouter(controller: ArticlesController, trpc: TRPC) {
  return trpc.router({
    articles: trpc.router({
      getFeed: trpc.publicProcedure
        .input(
          z.object({
            pagination: ZodPagination,
          }),
        )
        .query(({ input, ctx }) => controller.getFeed(ctx.user, input.pagination)),
      getMany: trpc.publicProcedure
        .input(
          z.object({
            pagination: ZodPagination,
            filters: ArticleFiltersDTO,
          }),
        )
        .query(({ input, ctx }) => controller.getManyArticles(ctx.user, input.filters, input.pagination)),
      getOne: trpc.publicProcedure
        .input(
          z.object({
            slug,
          }),
        )
        .query(({ input, ctx }) => controller.getArticle(ctx.user, input.slug)),
      create: trpc.protectedProcedure
        .input(CreateArticleDTO)
        .mutation(({ input, ctx }) => controller.createArticle(ctx.user, input)),
      update: trpc.protectedProcedure
        .input(
          z.object({
            slug,
            changes: article.partial(),
          }),
        )
        .mutation(({ input, ctx }) =>
          controller.updateArticle(ctx.user, input.slug, {
            article: input.changes,
          }),
        ),
      delete: trpc.protectedProcedure
        .input(
          z.object({
            slug,
          }),
        )
        .mutation(({ input, ctx }) => controller.deleteArticle(ctx.user, input.slug)),
      publish: trpc.protectedProcedure
        .input(
          z.object({
            slug,
          }),
        )
        .mutation(({ input, ctx }) => controller.publishArticle(ctx.user, input.slug)),
      unpublish: trpc.protectedProcedure
        .input(
          z.object({
            slug,
          }),
        )
        .mutation(({ input, ctx }) => controller.unpublishArticle(ctx.user, input.slug)),
    }),
  })
}
