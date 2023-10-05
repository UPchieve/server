import axios from 'axios'
import config from '../config'

export const http = axios.create({
  baseURL: 'https://api.laudspeaker.com',
  headers: {
    Authorization: `Api-Key ${config.laudspeakerApiKey}`,
    'Content-Type': 'application/json',
  },
})

export async function trackEvent(userId: string, event: string, payload = {}) {
  try {
    await http.post('/events', {
      correlationKey: 'userId',
      correlationValue: userId,
      source: 'custom',
      event,
      payload,
    })
  } catch (error) {
    throw error
  }
}
