import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import * as serverlessExpress from 'aws-serverless-express'
import { Server } from 'http'
import { createExpressApp } from './createExpressApp'

let lambdaProxyServer: Server
let cors: Awaited<ReturnType<typeof createExpressApp>>['corsOptions']

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!lambdaProxyServer) {
    const { app, corsOptions } = await createExpressApp()
    cors = corsOptions

    lambdaProxyServer = serverlessExpress.createServer(app, undefined, [
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

  response.headers['Access-Control-Allow-Origin'] = cors.origin
  response.headers['Access-Control-Allow-Credentials'] = cors.credentials
  response.headers['Access-Control-Allow-Methods'] = cors.methods
  response.headers['Access-Control-Allow-Headers'] = cors.allowedHeaders
  response.headers['Access-Control-Max-Age'] = cors.maxAge

  console.log({ event, response })

  return response
}
