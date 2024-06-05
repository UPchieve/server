import config from '../config'
import { isProductionEnvironment, isStagingEnvironment } from './environments'

export function buildAppLink(path: string): string {
  const { host } = config.client
  const protocol =
    isProductionEnvironment() || isStagingEnvironment() ? 'https' : 'http'
  return `${protocol}://${host}/${path}`
}
