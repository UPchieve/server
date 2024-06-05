import config from '../config'
import { getEnvironmentProtocol } from './environments'

export function buildAppLink(path: string): string {
  const { host } = config.client
  return `${getEnvironmentProtocol()}://${host}/${path}`
}
