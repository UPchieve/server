import { getAiModerationFeatureFlag } from '../services/FeatureFlagService'
import { Ulid } from '../models/pgUtils'
import { openai } from '../services/BotsService'
import { Job } from 'bull'
import logger from '../logger'

export interface ModerationSessionMessageJobData {
  censoredSessionMessage: {
    sessionId: string
    senderId: Ulid
    message: string
    sentAt: Date
    id: Ulid
  }
  isVolunteer: boolean
}

/**
 * Sends the given message to OpenAI to get back a moderation decision
 * and reason.
 * Also logs the decision reason(s) to NR.
 */
export default async function moderateSessionMessage(
  job: Job<ModerationSessionMessageJobData>
) {
  const aiModerationIsEnabled = await getAiModerationFeatureFlag(
    job.data.censoredSessionMessage.senderId
  )
  if (!aiModerationIsEnabled) {
    return
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: MODERATION_PROMPT_V1,
        },
        {
          role: 'user',
          content: wrapMessageInXmlTags(
            job.data.censoredSessionMessage.message,
            job.data.isVolunteer
          ),
        },
      ],
      response_format: { type: 'json_object' },
    })

    const decision = JSON.parse(chatCompletion.choices[0].message.content || '')
    const logData = {
      censoredSessionMessage: job.data.censoredSessionMessage,
      decision: {
        isClean: decision.appropriate,
        reasons: decision.reasons,
        moderatorVersion: MODERATION_VERSION,
      },
    }
    logger.info(logData, 'AI moderation result')
  } catch (err) {
    logger.error(
      {
        error: err,
        censoredSessionMessageId: job.data.censoredSessionMessage.id,
      },
      `Error while moderating session message`
    )
  }
}

/**
 * Enclose the given message in <student></student> or <tutor></tutor> tags.
 */
const wrapMessageInXmlTags = (
  message: string,
  isVolunteer: boolean
): string => {
  const xmlTag = isVolunteer ? 'tutor' : 'student'
  return `<${xmlTag}>${message}</${xmlTag}>`
}

const MODERATION_VERSION = 'openai_v1'

const MODERATION_PROMPT_V1 = `
You are moderating a chat room conversation between a student and an adult tutor. You are responsible for flagging inappropriate messages. Messages are delimited by XML tags, either <student> for messages sent by the the student or <tutor> for messages sent by the adult tutor.

When flagging a message, consider just the message in the XML tag.

A list of what should be considered inappropriate is below, delimited by the XML tag <reasons>.

Exceptions to what are considered harmful are delimited by the XML tag <exceptions>. Messages that meet the exception criteria should not be flagged.

For each message provided, please provide a JSON array response where the form of each element is delimited by triple quotes:

"""
{

  message: string,

  appropriate: boolean,

  reasons: string[],

}
"""

where 'message' is the message provided between XML tags, 'appropriate' is a decision on if the message is appropriate, and 'reasons' is an array of length at least 1 that describes the reason for the decision.

<reasons>
- Sharing where you live
- Sharing your contact information, including email, phone, and social media
- Using hateful language
- Using profanity, unless it is likely only a typo
- Making plans to communicate outside of this chat
- All other things you think are inappropriate for an adult to share with a minor or vice-a-versa
</reasons>

<exceptions>
- Links to common text-based collaboration tools (like Google Docs) that are shared for the purpose of reviewing school assignments
- Direct quotes from literature
- Profanity that is likely just a typo, such as "shit" instead of "shirt". In this event, prefer flagging the message as appropriate instead of inappropriate if and only if the context of the message indicates it was likely a mistake.
</exceptions>`
