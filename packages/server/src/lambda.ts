import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import * as serverlessExpress from 'aws-serverless-express'
import { Server } from 'http'
import { createExpressApp } from './createExpressApp'

let lambdaProxyServer: Server
let cors: Awaited<ReturnType<typeof createExpressApp>>['corsOptions']

const allowedOrigins = new Set<string>()
let allowedMethods = ''
let allowedHeaders = ''

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context, callback) => {
  if (!lambdaProxyServer) {
    const { app, corsOptions } = await createExpressApp()
    cors = corsOptions

    corsOptions.origin.forEach(origin => allowedOrigins.add(origin))
    allowedMethods = corsOptions.methods.join(',')
    allowedHeaders = corsOptions.allowedHeaders.join(',')

    lambdaProxyServer = serverlessExpress.createServer(app, callback, [
      'application/octet-stream',
      'font/eot',
      'font/opentype',
      'font/otf',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
    ])
  }

  const response = await serverlessExpress.proxy(lambdaProxyServer, event, context, 'PROMISE').promise

  if (event.headers.Origin && allowedOrigins.has(event.headers.Origin)) {
    response.headers['Access-Control-Allow-Origin'] = event.headers.Origin
    response.headers['Access-Control-Allow-Credentials'] = cors.credentials
    response.headers['Access-Control-Allow-Methods'] = allowedMethods
    response.headers['Access-Control-Allow-Headers'] = allowedHeaders
    response.headers['Access-Control-Max-Age'] = cors.maxAge
  }

  console.log({ event, response })

  return response
}
