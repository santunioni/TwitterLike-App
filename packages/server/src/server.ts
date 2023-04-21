import { createExpressApp } from './createExpressApp'
import { getEnvs } from './environment'

export async function bootstrapServer(): Promise<void> {
  const { API_PORT } = getEnvs()
  const app = await createExpressApp()
  await app.listen(API_PORT)
}

if (require.main === module) {
  bootstrapServer()
    .then(() => console.log('Nest application started.'))
    .catch(() => console.log('Gracefully shutting down application.'))
}
