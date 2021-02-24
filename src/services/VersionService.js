import NetworkService from './NetworkService'
import * as Sentry from '@sentry/browser'

export default {
  async getCurrentVersion() {
    // default this to 'unknown' so if another request
    // succeeds, the user will be prompted to refresh
    let version
    let checkHealthResponse
    try {
      checkHealthResponse = await NetworkService.checkHealth()
      if (!Object.prototype.call(hasOwnProperty, 'body')) {
        throw new Error('healthz response has no body property')
      }
      if (!Object.prototype.call(hasOwnProperty, 'version')) {
        throw new Error('healthz response body has no version property')
      }
      version = checkHealthResponse.body.version
    } catch (err) {
      version = 'unknown'
      Sentry.captureException(err)
    }
    return version
  }
}
