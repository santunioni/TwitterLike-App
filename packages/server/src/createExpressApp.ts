import { getEnvs } from './environment'
import { createContext } from './trpc/app'
import { createMergedTRPCApp } from './trpc/merged'
import { CommentsController } from './comments/comments.controller'
import { ArticlesController } from './articles/articles.controller'
import { AuthorsController } from './authors/authors.controller'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './nest/app.module'
import { SwaggerModule } from '@nestjs/swagger'
import { createPreConfiguredOpenAPIDocumentBuilder } from './nest/openapi'
import * as express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'

export async function createNestApplication(baseApiUrl: string) {
  const nest = await NestFactory.create(AppModule)
  SwaggerModule.setup(
    'docs',
    nest,
    SwaggerModule.createDocument(
      nest,
      createPreConfiguredOpenAPIDocumentBuilder().addServer(baseApiUrl).build(),
    ),
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
        nest.get(CommentsController),
        nest.get(ArticlesController),
        nest.get(AuthorsController),
      ),
      onError: (err) => delete err.error.stack, // Don't expose internal failures to the World
    }),
  )

  return app
}
