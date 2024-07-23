import { Router } from 'express'
import * as VoiceMessageService from '../../services/VoiceMessageService'
import { resError } from '../res-error'
import { Readable } from 'stream'

export function routeVoiceMessages(router: Router) {
  router.get('/voice-messages/:voiceMessageId', async function(req, res) {
    try {
      const options = {}
      let start
      let end
      const range = req.headers.range
      if (range) {
        const bytesPrefix = 'bytes='
        if (range.startsWith(bytesPrefix)) {
          const bytesRange = range.substring(bytesPrefix.length)
          const parts = bytesRange.split('-')
          if (parts.length === 2) {
            const rangeStart = parts[0] && parts[0].trim()
            if (rangeStart && rangeStart.length > 0) {
              options.start = start = parseInt(rangeStart)
            }
            const rangeEnd = parts[1] && parts[1].trim()
            if (rangeEnd && rangeEnd.length > 0) {
              options.end = end = parseInt(rangeEnd)
            }
          }
        }
      }

      const { voiceMessageId } = req.params
      const buffer = await VoiceMessageService.getFromStorage(voiceMessageId)
      res.set('content-type', 'audio/webm; codecs=opus')
      let contentLength = buffer.length
      if (req.method === 'head') {
        res.statusCode = 206
        res.setHeader('accept-ranges', 'bytes')
        res.setHeader('content-length', contentLength)
        res.end()
      } else {
        let retrievedLength
        if (start !== undefined && end !== undefined) {
          retrievedLength = end + 1 - start
        } else if (start !== undefined) {
          retrievedLength = contentLength - start
        } else if (end !== undefined) {
          retrievedLength = end + 1
        } else {
          retrievedLength = contentLength
        }

        // Listing 6.
        res.statusCode = start !== undefined || end !== undefined ? 206 : 200

        res.setHeader('content-length', retrievedLength)

        if (range !== undefined) {
          res.setHeader(
            'content-range',
            `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
          )
          res.setHeader('accept-ranges', 'bytes')
        }

        // Listing 7.

        const readable = new Readable()
        readable._read = () => {}
        readable.push(buffer)
        readable.push(null)
        readable.pipe(res)

        // const { voiceMessageId } = req.params
        // const buffer = await VoiceMessageService.getFromStorage(voiceMessageId)
        // const readable = new Readable()
        // readable._read = () => {}
        // readable.push(buffer)
        // readable.push(null)
        // res.set('accept-ranges', 'bytes')
        // readable.pipe(res)
      }

      // TODO do we need to verify current user is in session?
    } catch (error) {
      resError(res, error)
    }
  })
}
