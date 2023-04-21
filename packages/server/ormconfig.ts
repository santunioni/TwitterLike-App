import 'reflect-metadata'
import { createDataSourceInstance } from './src/datasource'
export const config = createDataSourceInstance()
export default [config]
