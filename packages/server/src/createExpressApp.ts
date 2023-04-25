import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import * as trpcExpress from '@trpc/server/adapters/express'
import * as cors from 'cors'
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

  const { BASE_URL, CORS_ALLOWED_ORIGINS, CORS_ALLOWED_METHODS, CORS_ALLOWED_HEADERS } = getEnvs()
  const nest = await createNestApplication(`${BASE_URL}/api`)

  if (process.env.DEBUG) {
    app.use((req, res, next) => {
      console.log({
        headers: JSON.parse(JSON.stringify(req.headers)),
        method: req.method,
        url: req.url,
      })
      next()
    })
  }

  app.use(
    cors({
      origin: CORS_ALLOWED_ORIGINS.split(','),
      allowedHeaders: CORS_ALLOWED_HEADERS.split(','),
      methods: CORS_ALLOWED_METHODS.split(','),
      maxAge: 86400,
    }),
  )

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
