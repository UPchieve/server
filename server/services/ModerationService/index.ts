import {
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
  DetectTextCommand,
  ModerationLabel,
  RekognitionClient,
} from '@aws-sdk/client-rekognition'
import {
  ComprehendClient,
  DetectPiiEntitiesCommand,
  DetectToxicContentCommand,
} from '@aws-sdk/client-comprehend'
import crypto from 'crypto'
import { LangfuseTraceClient, LangfuseGenerationClient } from 'langfuse-node'
import { chunk, isEmpty } from 'lodash'
import { TextPromptClient } from 'langfuse-core'
import logger from '../../logger'
import {
  CENSORED_BY,
  CensoredSessionMessage,
  createCensoredMessage,
} from '../../models/CensoredSessionMessage'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'
import {
  invokeModel as invokeOpenAI,
  MODEL_ID as OPENAI_MODEL_ID,
  OpenAiResults,
} from '../OpenAIService'
import * as UsersRepo from '../../models/User'
import * as SessionRepo from '../../models/Session'
import {
  ExtractedTextItem,
  SessionTranscript,
  SessionTranscriptItem,
} from '../../models/Session'
import {
  AI_MODERATION_STATE,
  getAiModerationFeatureFlag,
} from '../FeatureFlagService'
import { timeLimit } from '../../utils/time-limit'
import * as LangfuseService from '../LangfuseService'
import * as SessionService from '../SessionService'
import SocketService from '../SocketService'
import config from '../../config'
import * as ModerationInfractionsRepo from '../../models/ModerationInfractions'
import {
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  UserSessionFlags,
} from '../../constants'
import { putObject } from '../AwsService'
import * as ShareableDomainsRepo from '../../models/ShareableDomains/queries'
import {
  BedrockToolChoice,
  BedrockTools,
  invokeModel,
} from '../AwsBedrockService'
import { ModerationInfraction } from '../../models/ModerationInfractions/types'
import { getClient, runInTransaction, TransactionClient } from '../../db'
import { PrimaryUserRole } from '../UserRolesService'
import { resize } from '../../utils/image-utils'
import {
  getRealTimeSettings as getModerationRealTimeSettings,
  getContextualSettings as getModerationContextualSettings,
} from '../../models/ModerationSettings/queries'
import { GetModerationSettingResult } from '../../models/ModerationSettings/types'
import * as ModerationTypes from './types'
import * as FallBackPrompts from './fallbackPrompts'
import { weightModerationInfractions } from './ModerationPenaltyService'
import * as Regex from './regex'

// Image moderation
const AWS_CONFIG = {
  region: config.awsModerationToolsRegion,
  credentials: {
    accessKeyId: config.awsS3.accessKeyId,
    secretAccessKey: config.awsS3.secretAccessKey,
  },
}
const awsRekognitionClient = new RekognitionClient(AWS_CONFIG)
const awsComprehendClient = new ComprehendClient(AWS_CONFIG)

const topLevelCategoryFilter = (label: ModerationLabel) =>
  label.TaxonomyLevel === 1

const moderationLabelToFailureReason = (
  label: ModerationLabel
): ModerationTypes.ImageModerationFailureReason => {
  return {
    reason: label.Name ?? ModerationTypes.LiveMediaModerationCategories.UNKNOWN,
    details: { confidence: label.Confidence },
  }
}

const DIRECT_MESSAGE_TAG = 'direct_message'
const MESSAGE_TAG = 'session_chat'
const WHITEBOARD_TEXT_TAG = 'whiteboard_text'

async function detectImageEducationPurpose(
  image: Buffer,
  sessionId: string,
  trace?: LangfuseTraceClient
): Promise<ModerationTypes.ImageModerationFailureReason | null> {
  try {
    const prompt = await getPromptData(
      LangfuseService.LangfusePromptNameEnum.IS_IMAGE_EDUCATIONAL,
      ''
    )
    if (prompt.isFallback) throw Error("Couldn't get prompt")

    let generation: LangfuseGenerationClient | undefined = undefined
    if (trace) {
      generation = trace.generation({
        name: ModerationTypes.LangfuseGenerationName.IS_IMAGE_EDUCATIONAL,
        prompt: prompt.promptObject,
        model: config.awsBedrockSonnet4Id,
      })
    }

    const response_tool: BedrockTools = [
      {
        name: 'json_response',
        description: 'Prints answer in json format',
        input_schema: {
          type: 'object',
          properties: {
            detectedLabels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                    description: 'Educational subject detected',
                  },
                  confidence: {
                    type: 'number',
                    description: 'The confidence rating for the subject',
                  },
                },
                required: ['label', 'confidence'],
              },
            },
            reason: {
              type: 'string',
              description: 'The explanation of labels were chosen',
            },
          },
          required: ['detectedLabels', 'reason'],
        },
      },
    ]

    const response: {
      detectedLabels: [{ label: string; confidence: number }]
      reason: string
    } = await invokeModel({
      modelId: config.awsBedrockSonnet4Id,
      image,
      prompt: prompt.prompt,
      tools_option: {
        tool_choice: { type: BedrockToolChoice.TOOL, name: 'json_response' },
        tools: response_tool,
      },
    })

    if (generation) {
      generation.end({ output: response })
    }

    const nonEducational = response.detectedLabels.find(
      (category) =>
        category.label === 'NonEducational' &&
        category.confidence >= config.imageModerationMinConfidence
    )

    const educationalLabels = response.detectedLabels.filter(
      (category) =>
        category.confidence >= config.imageModerationMinConfidence &&
        category.label !== 'NonEducational'
    )

    if (
      isEmpty(response.detectedLabels) ||
      nonEducational ||
      isEmpty(educationalLabels)
    ) {
      return {
        reason: "The image doesn't serve any educational purpose",
        details: response,
      }
    }

    return null
  } catch (err) {
    logger.error(
      { sessionId, err },
      'Failed to detect if image is for educational purposes'
    )
    throw new Error(
      `Failed to detect if image is for educational purposes ${sessionId}`
    )
  }
}
async function detectPersonInImage(
  image: Buffer,
  sessionId: string,
  moderationSettings: GetModerationSettingResult,
  trace?: LangfuseTraceClient
) {
  try {
    let generation: LangfuseGenerationClient | undefined = undefined

    if (trace) {
      generation = trace.generation({
        name: ModerationTypes.LangfuseGenerationName.DETECT_PERSON,
      })
    }

    const labelResponse = await awsRekognitionClient.send(
      new DetectLabelsCommand({
        Image: {
          Bytes: new Uint8Array(image),
        },
        MinConfidence: config.imageModerationMinConfidence,
        Settings: {
          GeneralLabels: {
            LabelInclusionFilters: ['Person'],
          },
        },
      })
    )

    if (generation) {
      generation.end({ output: labelResponse })
    }

    const labels = labelResponse.Labels ?? []

    const personConfidenceThreshold =
      moderationSettings[
        ModerationTypes.LiveMediaModerationCategories.PERSON_IN_IMAGE
      ].threshold
    // Rekognition returns `Confidence` as a percentage from 0 to 100
    // Our DB thresholds are stored as decimals from 0 to 1. We convert them to percentages below for comparison
    const thresholdPercent = personConfidenceThreshold
      ? personConfidenceThreshold * 100
      : config.imageModerationMinConfidence

    const labelFailures = labels
      .filter(
        (label) => label.Confidence && label.Confidence >= thresholdPercent
      )
      .map((label) => ({
        reason: ModerationTypes.LiveMediaModerationCategories.PERSON_IN_IMAGE,
        details: {
          label: label.Name,
          confidence: label.Confidence,
        },
      }))

    return labelFailures
  } catch (err) {
    logger.error({ sessionId, err }, 'Failed to detect a person in image')
    throw new Error(
      `Failed to detect a person in image for session ${sessionId}`
    )
  }
}

/*
  detect harmful content in the image
  we are only looking at the top level categories for now:
    - Explicit
    - Non-Explicit Nudity of Intimate parts and Kissing
    - Swimwear or Underwear
    - Violence
    - Visually Disturbing
    - Drugs & Tobacco
    - Alcohol
    - Rude Gestures
    - Gambling
    - Hate Symbols
  full list of labels with categories can be found here: https://docs.aws.amazon.com/rekognition/latest/dg/samples/rekognition-moderation-labels.zip
*/
async function detectImageModerationFailures(
  image: Buffer,
  moderationSettings: GetModerationSettingResult,
  trace?: LangfuseTraceClient,
  sessionId?: string
) {
  try {
    let generation: LangfuseGenerationClient | undefined = undefined
    if (trace) {
      generation = trace.generation({
        name: ModerationTypes.LangfuseGenerationName.DETECT_MODERATION_LABELS,
      })
    }

    const moderationLabelsResponse = await awsRekognitionClient.send(
      new DetectModerationLabelsCommand({
        Image: {
          Bytes: new Uint8Array(image),
        },
        MinConfidence: config.imageModerationMinConfidence,
      })
    )
    if (generation) {
      generation.end({ output: moderationLabelsResponse })
    }

    const moderationLabels = moderationLabelsResponse.ModerationLabels ?? []
    return moderationLabels
      .filter(topLevelCategoryFilter)
      .filter((label) => {
        const confidence = label.Confidence
        if (!confidence) return false

        const threshold = label.Name
          ? moderationSettings[label.Name].threshold
          : 0
        // Rekognition returns `Confidence` as a percentage from 0 to 100
        // Our DB thresholds are stored as decimals from 0 to 1. We convert them to percentages below for comparison
        const thresholdPercent = threshold
          ? threshold * 100
          : config.imageModerationMinConfidence
        return confidence >= thresholdPercent
      })
      .map(moderationLabelToFailureReason)
  } catch (err) {
    logger.error({ sessionId, err }, 'Failed to moderate image')
    throw new Error(`Failed to moderate image for session ${sessionId}`)
  }
}

export async function extractTextFromImage(
  image: Buffer,
  trace?: LangfuseTraceClient
) {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: ModerationTypes.LangfuseGenerationName.EXTRACT_TEXT_FROM_IMAGE,
    })
  }

  const extractedText = await awsRekognitionClient.send(
    new DetectTextCommand({
      Image: {
        Bytes: new Uint8Array(image),
      },
    })
  )
  if (generation) {
    generation.end({ output: extractedText })
  }
  const detections = extractedText.TextDetections ?? []
  const textSegments = detections
    .filter(({ Type }) => Type === 'LINE')
    .map((detection) => detection.DetectedText ?? '')

  return textSegments
}

const detectToxicContent = async (
  textSegments: string[],
  moderationSettings: GetModerationSettingResult,
  trace?: LangfuseTraceClient
) => {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: ModerationTypes.LangfuseGenerationName.DETECT_TOXICITY_IN_TEXT,
      input: textSegments,
    })
  }

  const toxicContent = []
  const concatenatedText = textSegments.join(' ')
  const result = await awsComprehendClient.send(
    new DetectToxicContentCommand({
      TextSegments: [{ Text: concatenatedText }],
      LanguageCode: 'en',
    })
  )
  if (generation) {
    generation.end({ output: result })
  }
  if (result.ResultList) {
    toxicContent.push(
      ...result.ResultList.map((r) => ({
        text: concatenatedText,
        result: r,
      }))
    )
  }

  const rudeGesture =
    moderationSettings[
      ModerationTypes.LiveMediaModerationCategories.RUDE_GESTURES
    ]
  const threshold = rudeGesture
    ? rudeGesture.threshold * 100
    : config.toxicityModerationMinConfidence

  const highToxicity = toxicContent
    .filter(({ result }) => result.Toxicity && result.Toxicity >= threshold)
    .map(({ result, text }) => ({
      reason: ModerationTypes.LiveMediaModerationCategories.RUDE_GESTURES,
      details: {
        toxicity: result.Toxicity,
        text,
        labels: result.Labels,
      },
    }))

  return highToxicity
}

async function isLikelyToBeAnEmail({
  entityConfidence,
  entityText,
  sessionId,
  isVolunteer,
  trace,
}: {
  entityConfidence: number
  entityText: string
  sessionId: string
  isVolunteer: boolean
  trace?: LangfuseTraceClient
}) {
  const isMaybeEmail =
    entityConfidence >= config.emailModerationConfidenceThreshold &&
    Regex.EMAIL_REGEX.test(entityText)

  if (!isMaybeEmail) {
    return false
  }

  const aiModerationResult = await getAiModerationResult(
    {
      message: entityText,
      sessionId,
    },
    isVolunteer,
    trace
  )

  return aiModerationResult?.reasons?.email ?? false
}

async function isLikelyToBeAPhoneNumber({
  entityConfidence,
  entityText,
  sessionId,
  isVolunteer,
  trace,
}: {
  entityConfidence: number
  entityText: string
  sessionId: string
  isVolunteer: boolean
  trace?: LangfuseTraceClient
}) {
  // Since many users will be sharing numbers that look like phone numbers,
  // we want to moderate them in similar way we moderate phone numbers in messages.
  // PII is very permisive with what's a phone number, so let's run it through our regex
  // and then through the false positive fallback
  const isMaybePhone =
    entityConfidence >= config.phoneNumberModerationConfidenceThreshold &&
    Regex.PHONE_REGEX.test(entityText)

  if (!isMaybePhone) {
    return false
  }

  const aiModerationResult = await getAiModerationResult(
    {
      message: entityText,
      sessionId,
    },
    isVolunteer,
    trace
  )

  return aiModerationResult?.reasons?.phone ?? false
}

function existsInArray(array: any[], item: any) {
  return array.some((i) => i?.details?.text === item)
}

const meetsOrExceedsLinkConfidenceThreshold = (
  link: Pick<ModerationTypes.ModeratedLink, 'details'>
) => link.details.confidence >= Number(config.minimumModerationLinkConfidence)

export function filterDisallowedDomains({
  allowedDomains,
  links,
}: {
  allowedDomains: string[]
  links: ModerationTypes.ModeratedLink[]
}): ModerationTypes.ModeratedLink[] {
  const linksWithDisallowedDomain = (link: ModerationTypes.ModeratedLink) =>
    allowedDomains.every(
      // Check if the link contains any of the allowed domains
      // if it does, filter it out of this set and do not moderate it
      // allow all .edu domains
      (allowed) =>
        link.details.text.toLowerCase().indexOf(allowed) === -1 &&
        link.details.text.indexOf('.edu') === -1
    )
  return links.filter(linksWithDisallowedDomain)
}

async function checkForFullAddresses({
  text,
  sessionId,
}: {
  text: string
  sessionId: string
}): Promise<{
  reason: ModerationTypes.LiveMediaModerationCategories.ADDRESS
  details: { text: string; confidence: number; explanation: string }
} | null> {
  const modelId = config.awsBedrockSonnet4Id

  const promptData = await getPromptData(
    LangfuseService.LangfusePromptNameEnum
      .GET_ADDRESS_DETECTION_MODERATION_DECISION,
    FallBackPrompts.ADDRESS_DETECTION_FALLBACK_MODERATION_PROMPT
  )

  const t = LangfuseService.getClient().trace({
    name: ModerationTypes.LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    sessionId,
  })

  const VERIFY_EMAIL_RESPONSE_TOOL: BedrockTools = [
    {
      name: 'json_response',
      description: 'Prints answer in json format',
      input_schema: {
        type: 'object',
        properties: {
          confidence: {
            type: 'string',
            description: 'The confidence rating',
          },
          explanation: {
            type: 'string',
            description:
              'The explanation of why the confidence rating was choosen',
          },
        },
        required: ['confidence', 'explanation'],
      },
    },
  ]

  const gen = t.generation({
    name: ModerationTypes.LangfuseGenerationName
      .GET_ADDRESS_DETECTION_MODERATION_DECISION,
    model: modelId,
    input: { text },
    // Attach prompt object, if it exists, in order to associate the generation with the prompt in LF
    ...(promptData.promptObject && { prompt: promptData.promptObject }),
  })
  try {
    const completion =
      await invokeModel<ModerationTypes.AddressDetectionModelResponse>({
        modelId,
        text,
        prompt: promptData.prompt,
        tools_option: {
          tool_choice: { type: BedrockToolChoice.TOOL, name: 'json_response' },
          tools: VERIFY_EMAIL_RESPONSE_TOOL,
        },
      })

    gen.end({
      output: completion,
    })
    if (completion) {
      return {
        reason: ModerationTypes.LiveMediaModerationCategories.ADDRESS,
        details: {
          text,
          confidence: completion.confidence,
          explanation: completion.explanation,
        },
      }
    } else {
      return null
    }
  } catch (err) {
    logger.error({ sessionId, err }, 'Failed to detect addresses')
    return null
  }
}

async function checkForQuestionableLinks({
  links,
  sessionId,
}: {
  links: ModerationTypes.ModeratedLink[]
  sessionId: string
}): Promise<ModerationTypes.ModeratedLinkResponse | null> {
  const modelId = config.awsBedrockHaikuId

  const promptData = await getPromptData(
    LangfuseService.LangfusePromptNameEnum
      .GET_QUESTIONABLE_LINK_MODERATION_DECISION,
    FallBackPrompts.QUESTIONABLE_LINK_FALLBACK_MODERATION_PROMPT
  )

  const t = LangfuseService.getClient().trace({
    name: ModerationTypes.LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    sessionId,
  })

  const formattedLinks = links
    .map((link) => `<link>${link.details.text}</link>`)
    .join(' ')

  const gen = t.generation({
    name: ModerationTypes.LangfuseGenerationName
      .GET_QUESTIONABLE_LINK_MODERATION_DECISION,
    model: modelId,
    input: {
      links: formattedLinks,
    },
    // Attach prompt object, if it exists, in order to associate the generation with the prompt in LF
    ...(promptData.promptObject && { prompt: promptData.promptObject }),
  })

  const QUESTIONABLE_LINKS_RESPONSE_TOOL: BedrockTools = [
    {
      name: 'json_response',
      description: 'Prints answer in json format',
      input_schema: {
        type: 'object',
        properties: {
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                link: {
                  type: 'string',
                  description: 'The name of the extracted link',
                },
                confidence: {
                  type: 'number',
                  description:
                    'The confidence rating that the link is inappropriate',
                },
                policyNames: {
                  type: 'array',
                  items: { type: 'string' },
                  descrption: 'Array of the policy names the link violated',
                },
                explanation: {
                  type: 'string',
                  description:
                    'The explanation why the confidence and policyNames were choosen',
                },
              },
              required: ['link', 'confidence', 'policyNames', 'explanation'],
            },
          },
        },
        required: ['links'],
      },
    },
  ]

  try {
    const completion = await invokeModel<
      ModerationTypes.ModeratedLinkResponse['details']
    >({
      modelId,
      text: formattedLinks,
      prompt: promptData.prompt,
      tools_option: {
        tool_choice: { type: BedrockToolChoice.TOOL, name: 'json_response' },
        tools: QUESTIONABLE_LINKS_RESPONSE_TOOL,
      },
    })

    gen.end({
      output: completion,
    })
    if (completion) {
      return {
        reason: ModerationTypes.LiveMediaModerationCategories.LINK,
        details:
          completion satisfies ModerationTypes.ModeratedLinkResponse['details'],
      }
    } else {
      return null
    }
  } catch (err) {
    logger.error({ sessionId, err }, 'Failed to detect questionable links')
    return null
  }
}

async function detectPii(
  text: string,
  sessionId: string,
  isVolunteer: boolean,
  moderationSettings: GetModerationSettingResult,
  trace?: LangfuseTraceClient
) {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: ModerationTypes.LangfuseGenerationName.DETECT_PII_IN_TEXT,
      input: text,
    })
  }

  const piiEntities = await awsComprehendClient.send(
    new DetectPiiEntitiesCommand({
      Text: text,
      LanguageCode: 'en',
    })
  )
  if (generation) {
    generation.end({ output: piiEntities })
  }
  const entities = piiEntities.Entities ?? []

  const links: ModerationTypes.ModeratedLink[] = []
  const emails: ModerationTypes.ModeratedEmail[] = []
  const phones: ModerationTypes.ModeratedPhone[] = []
  const addresses: ModerationTypes.ModeratedAddress[] = []
  for (const entity of entities) {
    const entityStart = entity.BeginOffset
    const entityEnd = entity.EndOffset
    const entityText = text.slice(entityStart, entityEnd)
    const entityConfidence = Number(entity.Score)

    if (entity.Type === 'URL' && !existsInArray(links, entityText)) {
      links.push({
        reason: ModerationTypes.LiveMediaModerationCategories.LINK,
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    } else if (
      entity.Type === 'EMAIL' &&
      !existsInArray(emails, entityText) &&
      (await isLikelyToBeAnEmail({
        entityConfidence,
        entityText,
        sessionId,
        isVolunteer,
        trace,
      }))
    ) {
      emails.push({
        reason: ModerationTypes.LiveMediaModerationCategories.EMAIL,
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    } else if (
      entity.Type === 'PHONE' &&
      (await isLikelyToBeAPhoneNumber({
        entityConfidence,
        entityText,
        sessionId,
        isVolunteer,
        trace,
      })) &&
      !existsInArray(phones, entityText)
    ) {
      phones.push({
        reason: ModerationTypes.LiveMediaModerationCategories.PHONE,
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    } else if (
      entity.Type === 'ADDRESS' &&
      !existsInArray(addresses, entityText)
    ) {
      addresses.push({
        reason: ModerationTypes.LiveMediaModerationCategories.ADDRESS,
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    }
  }

  const moderatedPII: ModerationTypes.ModeratedPII[] = [...emails, ...phones]

  const allowedDomains = await ShareableDomainsRepo.getAllowedDomains()
  const moderatedLinks = filterDisallowedDomains({
    allowedDomains,
    links,
  }).filter(meetsOrExceedsLinkConfidenceThreshold)

  if (moderatedLinks.length > 0) {
    const questionableLinks = await checkForQuestionableLinks({
      links: moderatedLinks,
      sessionId,
    })
    if (questionableLinks !== null) {
      const moderatedQuestionableLinks = questionableLinks?.details.links
        .map(
          (link) =>
            ({
              reason: ModerationTypes.LiveMediaModerationCategories.LINK,
              details: {
                text: link.link,
                confidence: link.details.confidence,
                policyNames: link.details.policyNames,
                explanation: link.details.explanation,
              },
            }) as ModerationTypes.ModeratedLink
        )
        .filter(meetsOrExceedsLinkConfidenceThreshold)

      moderatedPII.push(...moderatedQuestionableLinks)
    }
  }

  if (addresses.length > 0) {
    const moderatedAddress = await checkForFullAddresses({ text, sessionId })

    const addressSetting =
      moderationSettings[ModerationTypes.LiveMediaModerationCategories.ADDRESS]

    const addressConfidenceThreshold = addressSetting
      ? addressSetting.threshold * 100
      : config.minimumModerationAddressConfidence

    if (
      moderatedAddress &&
      moderatedAddress?.details?.confidence >= addressConfidenceThreshold
    ) {
      moderatedPII.push(moderatedAddress)
    }
  }

  return moderatedPII
}

async function detectTextModerationFailures(
  image: Buffer,
  sessionId: string,
  isVolunteer: boolean,
  moderationSettings: GetModerationSettingResult,
  trace?: LangfuseTraceClient
) {
  const textSegments = await extractTextFromImage(image, trace)

  if (textSegments.length === 0) {
    return []
  }

  const [toxicity, pii] = await Promise.all([
    detectToxicContent(textSegments, moderationSettings, trace),
    detectPii(
      textSegments.join(' '),
      sessionId,
      isVolunteer,
      moderationSettings,
      trace
    ),
  ])

  return [...toxicity, ...pii]
}

export async function saveImageToBucket({
  sessionId,
  image,
  source,
}: {
  sessionId: string
  image: Buffer
  source: Extract<
    ModerationTypes.ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
}): Promise<{ location: string }> {
  let bucketName: string
  switch (source) {
    case 'screenshare':
      bucketName = config.awsS3.moderatedScreenshareBucket
      break
    case 'image_upload':
      bucketName = config.awsS3.moderatedSessionImageUploadBucket
      break
    case 'whiteboard':
      bucketName = config.awsS3.moderatedSessionWhiteboardImageUploadBucket
      break
  }
  if (!bucketName)
    throw new Error(
      `Could not save moderated image to S3: No bucket registered for source ${source}`
    )
  const s3Key = `${sessionId}-${crypto.randomBytes(8).toString('hex')}`
  const result = await putObject(bucketName, s3Key, image)
  return { location: result.location }
}

async function handleImageModerationFailure({
  userId,
  sessionId,
  failureReasons,
  image,
  source,
  moderationSettings,
}: {
  userId: string
  sessionId: string
  failureReasons: ModerationTypes.ImageModerationFailureReason[]
  image: Buffer
  source: Extract<
    ModerationTypes.ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
  moderationSettings: GetModerationSettingResult
}) {
  const { location: imageUrl } = await saveImageToBucket({
    sessionId,
    image,
    source,
  })

  logger.info(
    { sessionId, reasons: failureReasons, imageUrl, source, userId },
    'Image triggered moderation'
  )
  const failures = failureReasons.reduce(
    (acc, reason) => {
      acc[reason.reason] = {
        ...reason.details,
        imageUrl,
      }
      return acc
    },
    {} as Record<
      ModerationTypes.ImageModerationFailureReason['reason'],
      ModerationTypes.ImageModerationFailureReason['details']
    >
  )

  await handleModerationInfraction(
    userId,
    sessionId,
    { failures },
    source,
    moderationSettings
  )
}

function maybeHandleImageModerationFailure(options: {
  userId: string
  sessionId: string
  image: Buffer
  source: Extract<
    ModerationTypes.ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
  moderationSettings: GetModerationSettingResult
}) {
  return function (failures: ModerationTypes.ImageModerationFailureReason[]) {
    if (failures.length > 0) {
      handleImageModerationFailure({
        userId: options.userId,
        sessionId: options.sessionId,
        failureReasons: failures,
        image: options.image,
        source: options.source,
        moderationSettings: options.moderationSettings,
      })
    }
  }
}

/*
  This funciton is designed to ban a user from live media as fast as possible.
  To do that, we run each moderation check in parallel and issue moderation infractions
  as they happen. By not waiting for all checks to complete, we can ensure that we
  turn the screen share off as soon as possible.
*/
export async function moderateImageInBackground(options: {
  image: Buffer
  sessionId: string
  userId: string
  isVolunteer: boolean
  source: Extract<
    ModerationTypes.ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
  moderationSettings: GetModerationSettingResult
  trace?: LangfuseTraceClient
}) {
  detectImageModerationFailures(
    options.image,
    options.moderationSettings,
    options.trace,
    options.sessionId
  ).then(maybeHandleImageModerationFailure(options))

  detectPersonInImage(
    options.image,
    options.sessionId,
    options.moderationSettings,
    options.trace
  ).then(maybeHandleImageModerationFailure(options))

  detectTextModerationFailures(
    options.image,
    options.sessionId,
    options.isVolunteer,
    options.moderationSettings,
    options.trace
  ).then(maybeHandleImageModerationFailure(options))
}

async function getAllImageModerationFailures({
  image,
  sessionId,
  isVolunteer,
  moderationSettings,
  trace,
}: {
  image: Buffer
  sessionId: string
  isVolunteer: boolean
  moderationSettings: GetModerationSettingResult
  trace?: LangfuseTraceClient
}): Promise<{
  failureReasons: ModerationTypes.ImageModerationFailureReason[]
}> {
  const [
    moderationFailureReasons,
    textModerationFailureReasons,
    detectPersonResponse,
  ] = await Promise.all([
    detectImageModerationFailures(image, moderationSettings, trace, sessionId),
    detectTextModerationFailures(
      image,
      sessionId,
      isVolunteer,
      moderationSettings,
      trace
    ),
    detectPersonInImage(image, sessionId, moderationSettings, trace),
  ])

  if (
    isEmpty(moderationFailureReasons) &&
    isEmpty(textModerationFailureReasons) &&
    !isEmpty(detectPersonResponse)
  ) {
    const noEducationalContext = await detectImageEducationPurpose(
      image,
      sessionId,
      trace
    )

    if (noEducationalContext) {
      return { failureReasons: [noEducationalContext] }
    }
  }

  return {
    failureReasons: [
      ...moderationFailureReasons,
      ...textModerationFailureReasons,
    ],
  }
}

export async function getIndividualSessionMessageModerationResponse({
  censoredSessionMessage,
  isVolunteer,
  trace,
}: {
  censoredSessionMessage: Pick<
    CensoredSessionMessage,
    'sessionId' | 'message'
  > & { id?: string }
  isVolunteer: boolean
  trace?: LangfuseTraceClient
}) {
  const promptData = await getPromptData(
    LangfuseService.LangfusePromptNameEnum
      .GET_SESSION_MESSAGE_MODERATION_DECISION,
    FallBackPrompts.FALLBACK_MODERATION_PROMPT
  )

  let gen: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    gen = trace.generation({
      name: ModerationTypes.LangfuseGenerationName
        .SESSION_MESSAGE_MODERATION_DECISION,
      model: OPENAI_MODEL_ID,
      input: { censoredSessionMessage, isVolunteer },
      // Attach prompt object, if it exists, in order to associate the generation with the prompt in LF
      ...(promptData.promptObject && { prompt: promptData.promptObject }),
    })
  }

  try {
    const response = await invokeOpenAI({
      prompt: promptData.prompt,
      userMessage: wrapMessageInXmlTags(
        censoredSessionMessage.message,
        isVolunteer
      ),
    })

    if (gen) {
      gen.end({
        output: response,
      })
    }

    return response.results
  } catch (err) {
    logger.error(
      {
        error: err,
        censoredSessionMessageId:
          censoredSessionMessage?.id ??
          'No ID: Text was likely extracted from an image',
      },
      `Error while moderating session message`
    )
  }
}

const getPromptData = async (
  promptName: LangfuseService.LangfusePromptNameEnum,
  fallbackPrompt: string
): Promise<{
  isFallback: boolean
  prompt: string
  version: string
  promptObject?: TextPromptClient
}> => {
  const promptFromLangfuse = await LangfuseService.getPrompt(promptName)
  const isFallback = promptFromLangfuse === undefined

  return {
    isFallback,
    prompt: isFallback
      ? fallbackPrompt
      : (promptFromLangfuse! as TextPromptClient).prompt,
    version: isFallback
      ? 'FALLBACK'
      : `${promptFromLangfuse!.name}-${promptFromLangfuse!.version}`,
    ...(!isFallback && {
      promptObject: promptFromLangfuse as TextPromptClient,
    }),
  }
}

async function createIndividualSessionMessageModerationJob({
  censoredSessionMessage,
  isVolunteer,
}: {
  censoredSessionMessage: CensoredSessionMessage
  isVolunteer: boolean
}) {
  try {
    await QueueService.add(Jobs.ModerateSessionMessage, {
      censoredSessionMessage,
      isVolunteer,
    })
  } catch (err) {
    logger.error(
      censoredSessionMessage,
      `Failed to enqueue job ${Jobs.ModerateSessionMessage}`
    )
  }
}

function test({ regex, message }: { regex: RegExp; message: string }) {
  const results: string[] = []
  for (const [match] of message.matchAll(regex)) {
    results.push(match)
  }
  return results
}

const regexModerate = (
  message: string
): ModerationTypes.RegexModerationResult => {
  const failedTests = [
    ['email', test({ regex: Regex.EMAIL_REGEX, message })],
    ['phone', test({ regex: Regex.PHONE_REGEX, message })],
    ['profanity', test({ regex: Regex.PROFANITY_REGEX, message })],
    ['safety', test({ regex: Regex.SAFETY_RESTRICTION_REGEX, message })],
  ].filter(([, test]) => test.length > 0)

  const sanitize = (message: string): string => {
    let sanitizedMessage = message
    failedTests.forEach(([testName, testMatches]) => {
      ;(testMatches as string[]).forEach((match) => {
        const stars = '*'.repeat(match.length)
        sanitizedMessage = sanitizedMessage.replace(
          new RegExp(match, 'g'),
          stars
        )
      })
    })

    return sanitizedMessage
  }

  const isClean = failedTests.length === 0
  return {
    isClean,
    failures: { failures: Object.fromEntries(failedTests) },
    sanitizedMessage: isClean ? message : sanitize(message),
  }
}

const getAiModerationResult = async (
  censoredSessionMessage: Pick<CensoredSessionMessage, 'sessionId' | 'message'>,
  isVolunteer: boolean,
  trace?: LangfuseTraceClient
) => {
  return await timeLimit({
    promise: getIndividualSessionMessageModerationResponse({
      censoredSessionMessage,
      isVolunteer,
      trace,
    }),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage:
      'AI Moderation time limit reached. Returning regex value',
    waitInMs: config.moderateMessageTimeLimitMs,
  })
}

export type oldClientModerationResult = boolean

export async function moderateMessage({
  message,
  senderId,
  userType,
  sessionId,
}: {
  message: string
  senderId: string
  userType: PrimaryUserRole
  sessionId?: string
}): Promise<
  oldClientModerationResult | ModerationTypes.ModerationFailureReasons
> {
  let trace: LangfuseTraceClient | undefined = undefined
  const { isClean, failures } = regexModerate(message)

  /*
   * Old high-line mid town clients will not send up sessionId
   * return `true` or `false` for them
   */
  if (!sessionId) {
    return isClean
  }

  let result = failures
  if (!isClean) {
    trace = LangfuseService.getClient().trace({
      name: ModerationTypes.LangfuseTraceName.MODERATE_SESSION_MESSAGE,
      metadata: { sessionId, userId: senderId },
      input: message,
    })
    const censoredSessionMessage = await createCensoredMessage({
      senderId,
      message,
      sessionId,
      censoredBy: CENSORED_BY.regex,
    })

    const userTargetStatus = await getAiModerationFeatureFlag(senderId)
    if (userTargetStatus === AI_MODERATION_STATE.targeted) {
      const response: OpenAiResults | undefined = await getAiModerationResult(
        censoredSessionMessage,
        userType === 'volunteer',
        trace
      )

      const results: ModerationTypes.ModerationAIResult | undefined =
        response?.results as ModerationTypes.ModerationAIResult
      // Override the regex moderation decision with the AI one if it's available
      result.failures = !results
        ? result.failures
        : results?.appropriate
          ? {}
          : results.reasons
    } else if (userTargetStatus === AI_MODERATION_STATE.notTargeted) {
      await createIndividualSessionMessageModerationJob({
        censoredSessionMessage,
        isVolunteer: userType === 'volunteer',
      })
    }

    logger.info(
      { censoredSessionMessage, reasons: result },
      'Session message was censored'
    )
    return result
  }

  const session = await SessionRepo.getSessionById(sessionId)
  const isDm = !!session.endedAt
  if (!isDm) return { failures: {} }
  trace = LangfuseService.getClient().trace({
    name: ModerationTypes.LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    metadata: { sessionId, userId: senderId },
    input: message,
  })
  // For DMs, we'll moderate the context of the entire transcript to make sure the
  // conversation remains appropriate.
  const transcript = await SessionService.getSessionTranscript(sessionId)
  transcript.messages.push({
    messageId: 'in-flight',
    createdAt: new Date(),
    messageType: 'direct_message',
    userId: senderId,
    message,
    role: userType,
  } as SessionTranscriptItem)
  const transcriptModerationResults = await moderateTranscript(
    transcript,
    trace
  )
  const uncleanDms = transcriptModerationResults.filter((flagged) =>
    flagged.message.includes(DIRECT_MESSAGE_TAG)
  )
  if (uncleanDms.length) {
    const failures = {} as Record<string, string[]>
    transcriptModerationResults.forEach(
      (flagged) =>
        (failures[flagged.reason.toLowerCase().replace('_', ' ')] = [])
    )
    return { failures }
  } else {
    return { failures: {} }
  }
}

export const handleModerationInfraction = async (
  userId: string,
  sessionId: string,
  reasons:
    | ModerationTypes.ModerationFailureReasons
    | Record<
        ModerationTypes.ImageModerationFailureReason['reason'],
        ModerationTypes.ImageModerationFailureReason['details']
      >,
  source: ModerationTypes.ModerationSource,
  moderationSettings: GetModerationSettingResult,
  client = getClient()
) => {
  if (source === 'image_upload') {
    // Image uploads are premoderated, so if they fail moderation they are not shown to any user.
    // Therefore there is no need to write an infraction, which represents a retroactive strike for an offense.
    return
  }
  const socketService = SocketService.getInstance()
  const failures: string[] = [...new Set<string>(Object.keys(reasons.failures))]

  const allActiveInfractions =
    await ModerationInfractionsRepo.getModerationInfractionsByUser(
      userId,
      {
        active: true,
        sessionId,
      },
      client
    )

  const allInfractionResons = getReasonsFromInfractions(allActiveInfractions)

  if (
    isEmpty(
      failures.filter(
        (failure) =>
          failure ===
          ModerationTypes.LiveMediaModerationCategories.PERSON_IN_IMAGE
      )
    )
  ) {
    const insertedInfraction =
      await ModerationInfractionsRepo.insertModerationInfraction(
        {
          userId,
          sessionId,
          reason: reasons.failures,
        },
        client
      )

    const infractionScore = weightModerationInfractions(
      [
        ...allInfractionResons.filter(
          (infractionReason) =>
            infractionReason ===
            ModerationTypes.LiveMediaModerationCategories.PERSON_IN_IMAGE
        ),
        ...getReasonsFromInfractions([insertedInfraction]),
      ],
      moderationSettings
    )
    const streamStoppingReasons = getStreamStoppingReasonsFromInfractions([
      insertedInfraction,
    ])
    const doLiveMediaBan =
      infractionScore >= config.liveMediaBanInfractionScoreThreshold

    if (doLiveMediaBan) {
      await liveMediaBanUser(userId, sessionId)
      logger.info(
        { userId, sessionId, infractionId: insertedInfraction.id },
        'Live media banned user'
      )
    }

    await socketService.emitModerationInfractionEvent(userId, {
      isBanned: doLiveMediaBan,
      infraction: failures,
      source,
      occurredAt: new Date(),
      stopStreamImmediatelyReasons: streamStoppingReasons,
    })
  } else if (
    isEmpty(
      allInfractionResons.filter(
        (infractionReason) =>
          infractionReason ===
          ModerationTypes.LiveMediaModerationCategories.PERSON_IN_IMAGE
      )
    )
  ) {
    await runInTransaction(async (tc) => {
      /*
       * if a person in image infraction exist, the user already received a temporary ban already
       * if not, ban them temporarily until the partner in sesson confirms whether the frame is appropriate or not
       */
      await ModerationInfractionsRepo.insertModerationInfraction(
        {
          userId,
          sessionId,
          reason: reasons.failures,
        },
        tc
      )

      await liveMediaBanUser(userId, sessionId, tc)
    })

    await socketService.emitModerationInfractionEvent(userId, {
      isBanned: false,
      infraction: failures,
      source,
      occurredAt: new Date(),
      stopStreamImmediatelyReasons: failures,
    })
    //Let the partner user decide if there's an infraction
    await socketService.emitPotentialInfractionToPartnerEvent(
      sessionId,
      userId,
      {
        infraction: failures,
        source,
        occurredAt: new Date(),
      }
    )
  }
}

async function liveMediaBanUser(
  userId: string,
  sessionId: string,
  transactionClient?: TransactionClient
): Promise<void> {
  await runInTransaction(async (tc) => {
    await UsersRepo.banUserById(
      userId,
      USER_BAN_TYPES.LIVE_MEDIA,
      USER_BAN_REASONS.AUTOMATED_MODERATION,
      tc
    )
    await SessionService.markSessionForReview(
      sessionId,
      [UserSessionFlags.liveMediaBan],
      tc
    )
  }, transactionClient)
  await SocketService.getInstance().emitUserLiveMediaBannedEvents(
    userId,
    sessionId
  )
}

export function isStreamStoppingReason(
  category: ModerationTypes.LiveMediaModerationCategories
): boolean {
  const streamStoppingReasons = [
    ModerationTypes.LiveMediaModerationCategories.SWIM_WEAR,
    ModerationTypes.LiveMediaModerationCategories.VIOLENCE,
    ModerationTypes.LiveMediaModerationCategories.DISTURBING,
    ModerationTypes.LiveMediaModerationCategories.HATE_SYMBOLS,
    ModerationTypes.LiveMediaModerationCategories.LINK,
    ModerationTypes.LiveMediaModerationCategories.EMAIL,
    ModerationTypes.LiveMediaModerationCategories.PHONE,
    ModerationTypes.LiveMediaModerationCategories.ADDRESS,
    ModerationTypes.LiveMediaModerationCategories.EXPLICIT,
    ModerationTypes.LiveMediaModerationCategories.NON_EXPLICIT,
  ]
  return streamStoppingReasons.includes(category)
}

export function getReasonsFromInfractions(
  infractions: ModerationInfraction[]
): ModerationTypes.LiveMediaModerationCategories[] {
  return infractions.flatMap((i) => {
    debugger
    return Object.keys(i.reason)
  }) as ModerationTypes.LiveMediaModerationCategories[]
}

export function getStreamStoppingReasonsFromInfractions(
  infractions: ModerationInfraction[]
): ModerationTypes.LiveMediaModerationCategories[] {
  const reasons = getReasonsFromInfractions(infractions)
  return reasons.filter((reason) =>
    isStreamStoppingReason(
      reason as ModerationTypes.LiveMediaModerationCategories
    )
  )
}

export type CleanTranscriptModerationResult = {
  isClean: true
}
export type SanitizedTranscriptModerationResult = {
  isClean: false
  failures: { [key: string]: string[] }
  sanitizedTranscript: string
}
export const moderateIndividualTranscription = async ({
  transcript,
  sessionId,
  userId,
  saidAt,
  source,
}: {
  transcript: string
  sessionId: string
  userId: string
  saidAt: Date
  source: ModerationTypes.ModerationSource
}): Promise<
  CleanTranscriptModerationResult | SanitizedTranscriptModerationResult
> => {
  const { isClean, failures, sanitizedMessage } = regexModerate(transcript)
  if (isClean) return { isClean: true } as CleanTranscriptModerationResult
  // @TODO - run through AI moderation

  // If the message is unclean, track it as an infraction against the user
  const moderationSettings = await getModerationRealTimeSettings()
  await handleModerationInfraction(
    userId,
    sessionId,
    failures,
    source,
    moderationSettings
  )
  await createCensoredMessage({
    message: transcript,
    senderId: userId,
    sessionId,
    censoredBy: 'regex',
    sentAt: saidAt,
    shown: true,
  })

  return {
    isClean: false,
    failures: failures.failures,
    sanitizedTranscript: sanitizedMessage,
  } as SanitizedTranscriptModerationResult
}

export const moderateImage = async ({
  image,
  sessionId,
  userId,
  isVolunteer,
  source,
  aggregateInfractions,
  recordInfractions = true,
  trace,
}: {
  image: Buffer
  sessionId: string
  userId: string
  isVolunteer: boolean
  aggregateInfractions: boolean
  source: Extract<
    ModerationTypes.ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
  recordInfractions?: boolean
  trace?: LangfuseTraceClient
}): Promise<{
  isClean: boolean
  failures: string[]
} | void> => {
  const traceClient =
    (trace ?? source !== 'screenshare')
      ? LangfuseService.getClient().trace({
          name: ModerationTypes.LangfuseTraceName.MODERATE_IMAGE,
          metadata: {
            sessionId,
            isVolunteer,
            source,
            userId,
          },
        })
      : undefined

  const resizedImage = await resize(image)

  const moderationSettings = await getModerationRealTimeSettings()

  if (aggregateInfractions) {
    const result = await getAllImageModerationFailures({
      image: resizedImage,
      sessionId,
      isVolunteer,
      moderationSettings,
      trace: traceClient,
    })
    if (isEmpty(result.failureReasons)) return { isClean: true, failures: [] }

    if (recordInfractions) {
      await handleImageModerationFailure({
        userId,
        sessionId,
        failureReasons: result.failureReasons,
        image: resizedImage,
        source,
        moderationSettings,
      })
    }

    // Duplicate moderation failures may be present
    // if different objects in the image trigger it
    const failures: string[] = [
      ...new Set<string>(
        result.failureReasons.map((failure) => failure.reason)
      ),
    ]

    return { isClean: false, failures }
  } else {
    await moderateImageInBackground({
      image: resizedImage,
      sessionId,
      userId,
      isVolunteer,
      source,
      moderationSettings,
    })
  }
}

/**
 * Enclose the given message in <student></student> or <tutor></tutor> tags.
 */
export const wrapMessageInXmlTags = (
  message: string,
  isVolunteer: boolean
): string => {
  const xmlTag = isVolunteer ? 'tutor' : 'student'
  return `<${xmlTag}>${message}</${xmlTag}>`
}

const getSessionTranscriptModerationResult = async (
  prompt: string,
  chunkAsString: string,
  model: string,
  trace: LangfuseTraceClient,
  promptObject?: TextPromptClient
): Promise<TranscriptChunkModerationResult> => {
  const gen = trace.generation({
    name: ModerationTypes.LangfuseGenerationName
      .SESSION_TRANSCRIPT_MODERATION_DECISION,
    model,
    input: chunkAsString,
    ...(promptObject && { prompt: promptObject }),
  })
  const result = await invokeOpenAI({ prompt, userMessage: chunkAsString })
  gen.end({
    output: result,
  })
  const moderationResult = result.results as TranscriptChunkModerationResult
  return moderationResult
}

export type TranscriptChunkModerationResult = {
  confidence: number // higher = more likely to be inappropriate
  explanation: string
  reasons: ModerationTypes.ModerationSessionReviewFlagReason[]
  flaggedMessages: string[]
}
type FlaggedReason = {
  reason: ModerationTypes.ModerationSessionReviewFlagReason | string
  message: string
  confidence: Number
}
export const moderateTranscript = async (
  transcript: SessionTranscript,
  trace: LangfuseTraceClient,
  extractedText?: string[]
): Promise<FlaggedReason[]> => {
  const extractedTextItems: ExtractedTextItem[] =
    extractedText?.map((text) => {
      return {
        messageType: 'whiteboard_text',
        message: text,
        role: 'unknown',
      }
    }) ?? []

  const getChunkAsString = (
    chunk: (SessionTranscriptItem | ExtractedTextItem)[]
  ): string => {
    return chunk.reduce((acc: string, item) => {
      const messageTag =
        item.messageType === 'whiteboard_text'
          ? WHITEBOARD_TEXT_TAG
          : item.messageType === 'direct_message'
            ? DIRECT_MESSAGE_TAG
            : MESSAGE_TAG
      return (
        acc +
        `<${messageTag}><role>${item.role}</role>${item.message}</${messageTag}>\n`
      )
    }, '')
  }

  const promptData = await getPromptData(
    LangfuseService.LangfusePromptNameEnum.SESSION_TRANSCRIPT_MODERATION,
    FallBackPrompts.FALLBACK_TRANSCRIPT_MODERATION_PROMPT
  )

  const results: TranscriptChunkModerationResult[] = []
  const chunks: (SessionTranscriptItem | ExtractedTextItem)[][] = chunk(
    [...transcript.messages, ...extractedTextItems],
    config.contextualModerationBatchSize
  )

  for (const chunk of chunks) {
    const message = getChunkAsString(chunk)
    const result = await getSessionTranscriptModerationResult(
      promptData.prompt,
      message,
      OPENAI_MODEL_ID,
      trace,
      promptData?.promptObject
    )
    results.push(result)
  }

  const allReasons = results.flatMap((result) => result.reasons)

  const confidenceThresholdMap = new Map<string, Number>()

  const moderationSettings = await getModerationContextualSettings()

  for (const reason of allReasons) {
    const thresholdObj = moderationSettings[reason]

    if (thresholdObj) {
      confidenceThresholdMap.set(reason, Number(thresholdObj.threshold))
    } else {
      confidenceThresholdMap.set(
        reason,
        config.contextualModerationConfidenceThreshold
      )
      logger.warn({ reason }, 'No confidence threshold set for reason')
    }
  }

  let flaggedOutput: FlaggedReason[] = []

  for (const result of results) {
    for (const reason of result.reasons) {
      const threshold =
        confidenceThresholdMap.get(reason) ??
        config.contextualModerationConfidenceThreshold

      // OpenAI returns confidence as a percentage from 0 to 100
      // Our DB thresholds are stored as decimals from 0 to 1. We convert them to percentages below for comparison
      const thresholdPercent =
        Number(threshold) <= 1 ? Number(threshold) * 100 : Number(threshold)

      // Check for undefined confidence and handle gracefully
      if (result.confidence == null) {
        logger.warn(
          { reason, result },
          'Transcript moderation result missing confidence value'
        )
        continue
      }

      if (result.confidence >= thresholdPercent) {
        trace.update({
          tags: [LangfuseService.LangfuseTraceTagEnum.FLAGGED_BY_MODERATION],
        })
        for (const msg of result.flaggedMessages) {
          flaggedOutput.push({
            reason,
            message: msg,
            confidence: threshold,
          })
        }
      }
    }
  }

  return flaggedOutput
}

export function getSessionFlagByModerationReason(
  reason: ModerationTypes.ModerationSessionReviewFlagReason | string
): UserSessionFlags {
  switch (reason) {
    case 'PII':
      return UserSessionFlags.pii
    case 'INAPPROPRIATE_CONTENT':
      return UserSessionFlags.inappropriateConversation
    case 'PLATFORM_CIRCUMVENTION':
      return UserSessionFlags.platformCircumvention
    case 'HATE_SPEECH':
      return UserSessionFlags.hateSpeech
    case 'SAFETY':
      return UserSessionFlags.safetyConcern
    default:
      return UserSessionFlags.generalModerationIssue
  }
}
