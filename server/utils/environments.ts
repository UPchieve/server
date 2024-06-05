import config from '../config'

export function isDevEnvironment() {
  return config.NODE_ENV === 'dev'
}

export function isE2eEnvironment() {
  return config.NODE_ENV === 'test_e2e'
}

export function isProductionEnvironment() {
  return config.NODE_ENV === 'production'
}

export function isStagingEnvironment() {
  return config.NODE_ENV === 'staging'
}

export function isHttpsEnvironment() {
  return isStagingEnvironment() || isProductionEnvironment()
}

export function getEnvironmentProtocol() {
  return isHttpsEnvironment() ? 'https' : 'http'
}

export function isValidConfigToken(token: string) {
  return token !== 'bogus'
}
