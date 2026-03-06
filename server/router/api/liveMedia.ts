import { Request, Response, Router } from 'express'
import axios from 'axios'
import { resError } from '../res-error'
import config from '../../config'

export function routeLiveMedia(router: Router): void {
  router
    .route('/live-media/transcription/token')
    .post(async (req: Request, res: Response) => {
      const assemblyTokenUrl = `https://streaming.assemblyai.com/v3/token?expires_in_seconds=60`

      try {
        const response = await axios.get(assemblyTokenUrl, {
          headers: {
            Authorization: config.assemblyAiApiKey,
          },
        })

        res.json({ token: response.data.token })
      } catch (error) {
        resError(res, error)
      }
    })
}
