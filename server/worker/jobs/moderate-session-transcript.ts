import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as ModerationService from '../../services/ModerationService'
import * as WhiteboardService from '../../services/WhiteboardService'
import config from '../../config'
import { importFromStringSync } from 'module-from-string'
import { get } from 'node:https'

export function fetchRemoteJs(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data)).on('error', (err) => reject(err))
    })
  })
}

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function moderateSessionTranscript(
  job: Job<ModerateSessionTranscriptJobData>
) {
  const ZwibblerString = await fetchRemoteJs(config.zwibblerNodeUrl)
  // NOTE: we're grabbing the Zwibbler node library from our CDN
  // we don't want to keep it in the repo for licensing reasons
  // WARNING: DO NOT use 'module-from-string' for code we don't control since it
  // doesn't go through the same CVE checks that node modules do
  const ZwibblerLib = importFromStringSync(ZwibblerString, {
    globals: { setTimeout: setTimeout },
  })
  try {
    const transcript = await SessionService.getSessionTranscript(
      job.data.sessionId
    )
    const whiteboardDoc = await WhiteboardService.getDocFromStorage(
      job.data.sessionId
    )

    const whiteboardImage = await ZwibblerLib.Zwibbler.save(
      whiteboardDoc,
      'jpeg'
    )

    const moderatedWhiteboardResults = await ModerationService.moderateImage({
      image: Buffer.from(whiteboardImage, 'binary'),
      sessionId: job.data.sessionId,
      userId: '',
      isVolunteer: false,
      source: 'whiteboard',
      aggregateInfractions: true,
      recordInfractions: false,
    })

    if (moderatedWhiteboardResults?.failures.length) {
      await ModerationService.saveImageToBucket({
        sessionId: job.data.sessionId,
        image: Buffer.from(whiteboardImage, 'binary'),
        source: 'whiteboard',
      })
    }

    const extractedText = await ModerationService.extractTextFromImage(
      Buffer.from(whiteboardImage, 'binary')
    )
    const moderationResults = await ModerationService.moderateTranscript(
      transcript,
      extractedText
    )
    const combinedResults = [
      ...moderationResults.reasons,
      ...(moderatedWhiteboardResults?.failures ?? []),
    ]

    if (combinedResults.length) {
      const sessionFlags = combinedResults.map((r) =>
        ModerationService.getSessionFlagByModerationReason(r)
      )
      await ModerationService.markSessionForReview(
        job.data.sessionId,
        sessionFlags
      )
    }
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`
    )
  }
}
