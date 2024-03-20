import config from '../config'

export function isDevEnvironment() {
  return config.NODE_ENV === 'dev'
}
