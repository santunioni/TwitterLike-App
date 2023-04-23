export interface Article {
  title: string
  description: string
  body: string
  tags: string[]
}

export interface ArticleResponse extends Article {
  slug: string
  author: string
}

export type PartialArticle = Partial<Article>

export type ArticleSearchFields = Partial<Pick<Article, 'tags'> & Pick<ArticleResponse, 'author'>>

export interface UserDriver {
  login(username: string): Promise<void>
  follow(username: string): Promise<void>
  unfollow(username: string): Promise<void>
  publishArticle(slug: string): Promise<void>
  deleteArticle(slug: string): Promise<void>
  unpublishArticle(slug: string): Promise<void>
  writeArticle(article: Article): Promise<string>
  commentOnArticle(slug: string, comment: string): Promise<void>
  shouldFindArticleBy(filters: ArticleSearchFields, slug: string): Promise<void>
  shouldNotFindArticleBy(filters: ArticleSearchFields, slug: string): Promise<void>
  shouldFindTheArticle(slug: string): Promise<void>
  shouldNotFindTheArticle(slug: string): Promise<void>
  shouldSeeTheArticleInTheFeed(slug: string): Promise<void>
  shouldNotSeeTheArticleInTheFeed(slug: string): Promise<void>
  shouldSeeCommentFrom(slug: string, username: string): Promise<void>
}
