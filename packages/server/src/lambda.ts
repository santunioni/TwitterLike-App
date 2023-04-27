import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import * as serverlessExpress from 'aws-serverless-express'
import { Server } from 'http'
import { createExpressApp } from './createExpressApp'

let lambdaProxyServer: Server
let cors: Awaited<ReturnType<typeof createExpressApp>>['corsOptions']

let allowedMethods = ''
let allowedHeaders = ''
let allowedOrigins = ''

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context, callback) => {
  if (!lambdaProxyServer) {
    const { app, corsOptions } = await createExpressApp()
    cors = corsOptions

    allowedMethods = corsOptions.methods.join(',')
    allowedHeaders = corsOptions.allowedHeaders.join(',')
    allowedOrigins = corsOptions.origin.join(',')

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

  response.headers['access-control-allow-origin'] = allowedOrigins
  response.headers['access-control-allow-credentials'] = cors.credentials
  response.headers['access-control-allow-methods'] = allowedMethods
  response.headers['access-control-allow-headers'] = allowedHeaders
  response.headers['access-control-max-age'] = cors.maxAge

  console.log({ event, response })

  return response
}
