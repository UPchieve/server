import { Job } from 'bull'
import { log } from '../logger'
import { Ulid, Uuid } from '../../models/pgUtils'
import { getMessagesForFrontend, getSessionById } from '../../models/Session'
import {
  ComprehendClient,
  DetectDominantLanguageCommand,
} from '@aws-sdk/client-comprehend'
import config from '../../config'
import { asString } from '../../utils/type-utils'
import { captureEvent } from '../../services/AnalyticsService'
import { EVENTS } from '../../constants'
import { getDisplayVolunteerLanguagesFlag } from '../../services/FeatureFlagService'
import { secondsInMs } from '../../utils/time-utils'

type DetectLanguagesSessionJobData = {
  sessionId: Uuid
  studentId: Ulid
}

const AWS_CONFIG = {
  region: config.awsModerationToolsRegion,
  credentials: {
    accessKeyId: config.awsS3.accessKeyId,
    secretAccessKey: config.awsS3.secretAccessKey,
  },
  requestHandler: {
    requestTimeout: secondsInMs(30),
  },
}
const awsComprehendClient = new ComprehendClient(AWS_CONFIG)

const MINIMUM_TRANSCRIPT_LENGTH_FOR_LANGUAGE_DETECTION = 20

async function detectLanguages(text: string) {
  const response = await awsComprehendClient.send(
    new DetectDominantLanguageCommand({
      Text: text,
    })
  )

  return response.Languages
}

export default async (
  job: Job<DetectLanguagesSessionJobData>
): Promise<void> => {
  if (!(await getDisplayVolunteerLanguagesFlag(job.data.studentId))) return

  const sessionId = asString(job.data.sessionId)
  const session = await getSessionById(sessionId)
  if (!session) throw new Error(`Session ${sessionId} not found`)

  try {
    const messages = await getMessagesForFrontend(session.id)
    const transcript = messages.map((msg) => msg.contents).join(' ')
    if (
      !transcript ||
      // AWS Comprehend requires at least 20 characters in the input text for DetectDominantLanguage API
      transcript.length < MINIMUM_TRANSCRIPT_LENGTH_FOR_LANGUAGE_DETECTION
    ) {
      log(`Not enough content to detect language for session ${session.id}`)
      return
    }

    const languages = await detectLanguages(transcript)
    const languageCodes =
      languages?.map((lang) => lang.LanguageCode).join(',') || ''
    const primaryLanguage = languages?.[0]?.LanguageCode || ''
    captureEvent(session.studentId, EVENTS.SESSION_LANGUAGES_DETECTED, {
      sessionId: sessionId,
      languages: languageCodes,
      primaryLanguage,
      rawLanguages: languages,
    })
  } catch (error) {
    throw new Error(
      `Failed to detect language for session ${sessionId}. Error: ${error}`
    )
  }
}
