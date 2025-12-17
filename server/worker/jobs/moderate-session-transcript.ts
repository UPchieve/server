import { Ulid } from '../../models/pgUtils'
import { Job } from 'bull'
import * as SessionService from '../../services/SessionService'
import * as ModerationService from '../../services/ModerationService'
import * as WhiteboardService from '../../services/WhiteboardService'
import * as LangfuseService from '../../services/LangfuseService'
import config from '../../config'
import { importFromStringSync } from 'module-from-string'
import logger from '../../logger'
import { LangfuseTraceName } from '../../services/ModerationService'
import { fetchRemoteJs } from '../../utils/fetch-remote-js'

export interface ModerateSessionTranscriptJobData {
  sessionId: Ulid
}

export default async function moderateSessionTranscript(
  job: Job<ModerateSessionTranscriptJobData>
) {
  const trace = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_TRANSCRIPT,
    sessionId: job.data.sessionId,
    metadata: {
      sessionId: job.data.sessionId,
    },
  })
  const ZwibblerString = await fetchRemoteJs(config.zwibblerNodeUrl)

  logger.warn(`1. zwibbler imported string, ${ZwibblerString}`)

  // NOTE: we're grabbing the Zwibbler node library from our CDN
  // we don't want to keep it in the repo for licensing reasons
  // WARNING: DO NOT use 'module-from-string' for code we don't control since it
  // doesn't go through the same CVE checks that node modules do
  const ZwibblerLib = importFromStringSync(ZwibblerString, {
    globals: { setTimeout: setTimeout },
  })

  logger.warn(`2. zwibbler imported lib, ${ZwibblerLib}`)
  try {
    const transcript = await SessionService.getSessionTranscript(
      job.data.sessionId
    )

    logger.warn(`3. transcript, ${transcript}`)
    const whiteboardDoc = await WhiteboardService.getDocFromStorage(
      job.data.sessionId
    )

    let extractedText = undefined
    let moderatedWhiteboardResults = undefined
    if (whiteboardDoc.length > 0) {
      logger.warn(`4. whiteboardDoc`, whiteboardDoc)
      let whiteboardImage = null
      try {
        whiteboardImage = await ZwibblerLib.Zwibbler.save(whiteboardDoc, 'jpeg')
      } catch {
        logger.warn(
          `Failed to create image from whiteboard for session ${job.data.sessionId}`
        )
      }

      logger.warn(`4.5. whiteboardImage, ${whiteboardImage}`)
      if (whiteboardImage) {
        const imageBuffer = Buffer.from(whiteboardImage, 'binary')
        logger.warn(`4.75 image buffer ${imageBuffer}`)
        moderatedWhiteboardResults = await ModerationService.moderateImage({
          image: imageBuffer,
          sessionId: job.data.sessionId,
          userId: '',
          isVolunteer: false,
          source: 'whiteboard',
          aggregateInfractions: true,
          recordInfractions: false,
          trace,
        })

        logger.warn(
          `5. moderatedWhiteboardResults, ${moderatedWhiteboardResults}`
        )

        if (moderatedWhiteboardResults?.failures.length) {
          logger.warn(
            `6. saving whiteboard image to bucket, ${whiteboardImage}`
          )
          await ModerationService.saveImageToBucket({
            sessionId: job.data.sessionId,
            image: Buffer.from(whiteboardImage, 'binary'),
            source: 'whiteboard',
          })
        }

        extractedText = await ModerationService.extractTextFromImage(
          Buffer.from(whiteboardImage, 'binary'),
          trace
        )
      }
    }

    logger.warn(`7. extractedText, ${extractedText?.join(' | ')}`)

    const moderationResults = await ModerationService.moderateTranscript(
      transcript,
      trace,
      extractedText
    )

    logger.warn(`8. moderationResults, ${moderationResults}`)

    const combinedResults = [
      ...moderationResults.map((flagged) => flagged.reason),
      ...(moderatedWhiteboardResults?.failures ?? []),
    ]

    logger.warn(`9. combinedResults, ${combinedResults}`)

    if (combinedResults.length) {
      logger.warn('10. getting session flags')
      const sessionFlags = combinedResults.map((r) =>
        ModerationService.getSessionFlagByModerationReason(r)
      )

      logger.warn(`11. marking session for review, ${sessionFlags}`)
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
