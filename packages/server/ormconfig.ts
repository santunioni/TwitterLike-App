import 'reflect-metadata'
import { createDataSourceInstance } from './src/datasource'
export const config = createDataSourceInstance({
  migrations: ['src/migrations/*.ts'],
  migrationsTransactionMode: 'each',
})
export default [config]
