import config from '../config'

enum Environment {
  DEV = 'dev',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export function isDevEnvironment(): boolean {
  return config.NODE_ENV === Environment.DEV
}

export function isStagingEnvironment(): boolean {
  return config.NODE_ENV === Environment.STAGING
}

export function isProductionEnvironment(): boolean {
  return config.NODE_ENV === Environment.PRODUCTION
}
