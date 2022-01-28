import { createApp } from '@unleash/proxy'
import { initialize } from 'unleash-client'
import config from '../config'

export const unleashProxy = createApp({
  unleashUrl: config.unleashUrl,
  unleashInstanceId: config.unleashId,
  environment: config.unleashName,
  logLevel: 'info',
  refreshInterval: 1000
})

export const initializeUnleash = (): void => {
  if (config.unleashId)
    initialize({
      url: config.unleashUrl,
      appName: config.unleashName,
      instanceId: config.unleashId,
      refreshInterval: 1000
    })
}
