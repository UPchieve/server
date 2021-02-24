import NetworkService from './NetworkService'

export default {
  async getCurrentVersion() {
    const checkHealthResponse = await NetworkService.checkHealth()
    return checkHealthResponse.body.version
  }
}
