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
    // The whiteboard steps below must not abort the job before the transcript
    // is moderated, or the session ends up unexamined and unflagged, which
    // reads as clean. We hold the first failure and rethrow it at the end.
    //
    // Held in an object because `throw ''` would be falsy, and a bare
    // `if (whiteboardFailure)` would then skip the rethrow and pass the job.
    let whiteboardFailure: { err: unknown } | undefined
    const recordWhiteboardFailure = (err: unknown, message: string) => {
      // ??= keeps the first failure if both steps fail.
      whiteboardFailure ??= { err }
      logger.error({ err, sessionId: job.data.sessionId }, message)
    }

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

        try {
          moderatedWhiteboardResults = await ModerationService.moderateImage(
            imageBuffer,
            { source: 'whiteboard', sessionId: job.data.sessionId },
            trace
          )

          if (moderatedWhiteboardResults?.failures.length) {
            await ModerationService.saveInfractionImageToBucket({
              locationPrefix: job.data.sessionId,
              image: imageBuffer,
              source: 'whiteboard',
            })
          }
        } catch (err) {
          recordWhiteboardFailure(err, 'Failed to moderate whiteboard image')
        }

        try {
          extractedText = await VisionService.extractTextFromImage(
            imageBuffer,
            trace
          )
        } catch (err) {
          recordWhiteboardFailure(
            err,
            'Failed to extract text from whiteboard image'
          )
        }
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

    if (whiteboardFailure) throw whiteboardFailure.err
  } catch (err) {
    throw new Error(
      `Failed to moderate transcript for session ${job.data.sessionId}. Error: ${err}`,
      { cause: err }
    )
  }
}
