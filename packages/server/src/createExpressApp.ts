import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import * as trpcExpress from '@trpc/server/adapters/express'
import * as express from 'express'
import { ArticlesController } from './articles/articles.controller'
import { AuthorsController } from './authors/authors.controller'
import { CommentsController } from './comments/comments.controller'
import { getEnvs } from './environment'
import { AppModule } from './nest/app.module'
import { createPreConfiguredOpenAPIDocumentBuilder } from './nest/openapi'
import { createContext } from './trpc/app'
import { createMergedTRPCApp } from './trpc/merged'

export async function createNestApplication(baseApiUrl: string) {
  const nest = await NestFactory.create(AppModule)
  SwaggerModule.setup(
    'docs',
    nest,
    SwaggerModule.createDocument(nest, createPreConfiguredOpenAPIDocumentBuilder().addServer(baseApiUrl).build()),
    {
      useGlobalPrefix: true,
    },
  )
  await nest.init()
  return nest
}

export async function createExpressApp() {
  const app = express()

  const { BASE_URL } = getEnvs()
  const nest = await createNestApplication(`${BASE_URL}/api`)

  app.use('/api', nest.getHttpAdapter().getInstance())

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      createContext: createContext,
      router: createMergedTRPCApp(
        nest.get(CommentsController) as CommentsController,
        nest.get(ArticlesController) as ArticlesController,
        nest.get(AuthorsController) as AuthorsController,
      ),
      onError: err => delete err.error.stack, // Don't expose internal failures to the World
    }),
  )

  return app
}
