import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as ModerationService from '../../services/ModerationService'
import * as VisionService from '../../services/VisionService'
import * as WhiteboardService from '../../services/WhiteboardService'
import { client as langfuseClient } from '../../clients/langfuse'
import config from '../../config'
import { importFromStringSync } from 'module-from-string'
import logger from '../../logger'
import { LangfuseTraceName } from '../../services/ModerationService/types'
import { fetchRemoteJs } from '../../utils/fetch-remote-js'
import { UserSessionFlags } from '../../constants'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function moderateSessionTranscript(
  job: Job<ModerateSessionTranscriptJobData>
) {
  const trace = langfuseClient.trace({
    name: LangfuseTraceName.MODERATE_SESSION_TRANSCRIPT,
    sessionId: job.data.sessionId,
    metadata: {
      sessionId: job.data.sessionId,
    },
  })
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

    let extractedText = undefined
    let moderatedWhiteboardResults = undefined
    if (whiteboardDoc.length > 0) {
      let whiteboardImage = null
      try {
        whiteboardImage = await ZwibblerLib.Zwibbler.save(whiteboardDoc, 'jpeg')
      } catch {
        logger.warn(
          `Failed to create image from whiteboard for session ${job.data.sessionId}`
        )
      }

      if (whiteboardImage) {
        const imageBuffer = Buffer.from(whiteboardImage, 'binary')

        moderatedWhiteboardResults = await ModerationService.moderateImage(
          imageBuffer,
          { source: 'whiteboard', sessionId: job.data.sessionId },
          trace
        )

        if (moderatedWhiteboardResults?.failures.length) {
          await ModerationService.saveInfractionImageToBucket({
            locationPrefix: job.data.sessionId,
            image: Buffer.from(whiteboardImage, 'binary'),
            source: 'whiteboard',
          })
        }

        extractedText = await VisionService.extractTextFromImage(
          Buffer.from(whiteboardImage, 'binary'),
          trace
        )
      }
    }

    const moderationResults = await ModerationService.moderateTranscript(
      transcript,
      trace,
      extractedText
    )

    const transcriptModerationReasons = moderationResults.map(
      (flagged) => flagged.reason
    )

    const sessionFlags = []

    if (transcriptModerationReasons.length) {
      sessionFlags.push(
        ...transcriptModerationReasons.map((r) =>
          ModerationService.getSessionFlagByModerationReason(r)
        )
      )
    }

    if (moderatedWhiteboardResults?.failures?.length) {
      sessionFlags.push(UserSessionFlags.whiteboardImageModeration)
    }

    if (sessionFlags.length) {
      await SessionService.markSessionForReview(
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
