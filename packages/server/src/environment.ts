function readEnvs() {
  const TOKEN_PRIVATE_KEY = process.env.TOKEN_PRIVATE_KEY ?? 'TOKEN_PRIVATE_KEY'
  const AUDIENCE = process.env.AUDIENCE ?? 'RealWorldApp'
  const API_PORT = Number(process.env.API_PORT ?? '3000')
  const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
  const VERSION = process.env.VERSION ?? '0.0.0'
  const DATABASE_URL = process.env.DATABASE_URL
  const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS ?? '*'
  const CORS_ALLOWED_HEADERS = process.env.CORS_ALLOWED_HEADERS ?? 'Content-Type,Authorization'
  const CORS_ALLOWED_METHODS = process.env.CORS_ALLOWED_METHODS ?? 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
  return {
    TOKEN_PRIVATE_KEY,
    DATABASE_URL,
    AUDIENCE,
    API_PORT,
    BASE_URL,
    VERSION,
    CORS_ALLOWED_ORIGINS,
    CORS_ALLOWED_HEADERS,
    CORS_ALLOWED_METHODS,
  }
}

let envs: ReturnType<typeof readEnvs>

export function getEnvs() {
  if (!envs) {
    envs = readEnvs()
  }
  return envs
}
