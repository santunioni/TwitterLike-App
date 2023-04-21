import { DataSource } from 'typeorm'
import { createUnitTestDataSource } from '../datasource'
import { ArticlesRepository, TagsRepository } from './articles.repository'
import {
  TypeORMArticlesRepository,
  TypeORMTagsRepository,
} from './articles.repository.typeorm'
import { makeRandomArticle } from './articles.mock'

let dataSource: DataSource
let tagsRepository: TagsRepository
let articlesRepository: ArticlesRepository

beforeAll(async () => {
  dataSource = await createUnitTestDataSource().initialize()
  tagsRepository = new TypeORMTagsRepository(dataSource.manager)
  articlesRepository = new TypeORMArticlesRepository(dataSource.manager)
})

afterAll(async () => {
  await dataSource.destroy()
})

let testRandomNumber: number
let authorId: number

beforeEach(async () => {
  testRandomNumber = Date.now() % 10 ** 9
  authorId = testRandomNumber
})

describe('ArticlesRepository', () => {
  it('should create article', async () => {
    // Arrange
    const { title, slug, body, description } = makeRandomArticle({
      title: `How to train your dragon? ${testRandomNumber}`,
    })

    // Act
    const createdArticle = await articlesRepository.createArticle(
      { title, slug, body, description },
      { id: authorId },
    )
    const queriedArticle = await articlesRepository.getArticles({
      filterBySlug: slug,
      owner: { id: authorId },
    })

    // Assert
    const matchObject = {
      id: expect.any(Number),
      title,
      slug,
      body,
      description,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      author: {
        id: authorId,
      },
    }
    expect(createdArticle).toMatchObject(matchObject)
    expect(queriedArticle).toEqual([{ ...matchObject, published: false }])
  })

  it('should return updated article', async () => {
    // Arrange
    const { title, slug, body, description } = makeRandomArticle({
      title: `How to train your dragon? ${testRandomNumber}`,
    })
    await articlesRepository.createArticle(
      { title, slug, body, description },
      { id: authorId },
    )

    // Act
    const updatedArticle = await articlesRepository.updateArticle(
      slug,
      { id: authorId },
      { body: 'Blabla' },
    )
    const queriedArticle = await articlesRepository.getArticles({
      filterBySlug: slug,
      owner: { id: authorId },
    })

    // Assert
    const matchObject = {
      id: expect.any(Number),
      title,
      slug,
      body: 'Blabla',
      description,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      author: {
        id: authorId,
      },
    }
    expect(updatedArticle).toMatchObject(matchObject)
    expect(queriedArticle).toEqual([{ ...matchObject, published: false }])
  })
})

describe('TagsRepository', () => {
  it('should set article tags', async () => {
    const tags = await tagsRepository.setArticleTags({ id: testRandomNumber }, [
      'dragons',
      'friendship',
    ])
    expect(tags).toEqual(['dragons', 'friendship'])
    expect(
      await tagsRepository.getArticleTags({ id: testRandomNumber }),
    ).toEqual(['dragons', 'friendship'])
  })
})
