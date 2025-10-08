import axios from 'axios'
import config from '../config'

export async function createSlackAlert(title: string, message: string) {
  return axios.post(config.slackAlertWebHookUrl, {
    title,
    message,
  })
}
