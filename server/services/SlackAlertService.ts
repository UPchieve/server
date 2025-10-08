import axios from 'axios'
import config from '../config'

export async function sendSlackAlert(title: string, message: string) {
  return axios.post(config.slackAlertWebHookUrl, {
    title,
    message,
  })
}
