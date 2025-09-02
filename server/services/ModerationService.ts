import logger from '../logger'
import { chunk, isEmpty } from 'lodash'
import {
  CENSORED_BY,
  CensoredSessionMessage,
  createCensoredMessage,
} from '../models/CensoredSessionMessage'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import {
  invokeModel as invokeOpenAI,
  OpenAiResults,
  MODEL_ID as OPENAI_MODEL_ID,
} from './OpenAIService'
import * as UsersRepo from '../models/User/queries'
import * as SessionRepo from '../models/Session'
import {
  ExtractedTextItem,
  SessionTranscript,
  SessionTranscriptItem,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
} from '../models/Session'
import {
  AI_MODERATION_STATE,
  getAiModerationFeatureFlag,
} from './FeatureFlagService'
import { timeLimit } from '../utils/time-limit'
import * as LangfuseService from './LangfuseService'
import { LangfusePromptNameEnum, LangfuseTraceTagEnum } from './LangfuseService'
import * as SessionService from './SessionService'
import { TextPromptClient } from 'langfuse-core'
import SocketService from './SocketService'
import config from '../config'
import * as ModerationInfractionsRepo from '../models/ModerationInfractions'
import {
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  UserSessionFlags,
} from '../constants'
import {
  DetectFacesCommand,
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
import { putObject } from './AwsService'
import * as ShareableDomainsRepo from '../models/ShareableDomains/queries'
import {
  invokeModel,
  BedrockToolChoice,
  BedrockTools,
} from './AwsBedrockService'
import { LangfuseTraceClient } from 'langfuse-node'
import { ModerationInfraction } from '../models/ModerationInfractions/types'
import { getClient, runInTransaction, TransactionClient } from '../db'
import { PrimaryUserRole } from './UserRolesService'

import { LangfuseGenerationClient } from 'langfuse'

const MINOR_AGE_THRESHOLD = 18

// EMAIL_REGEX checks for standard and complex email formats
// Ex: yay-hoo@yahoo.hello.com
const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi

// PHONE_REGEX checks for 7/10 digit phone numbers with/out punctuation, not surrounded by other numbers
const PHONE_REGEX =
  /([^\d]|^)(\+\d{1,2}\s)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}([^\d]|$)/g

// PROFANITY_REGEX - Google's list of common bad words
const PROFANITY_REGEX =
  /\b(4r5e|5h1t|5hit|a55s|ass-fucker|assfucker|assfukka|a_s_s|b!tch|b00bs|b17ch|b1tch|ballsack|beastial|beastiality|bestiality|blow job|blowjob|blowjobs|boiolas|booooooobs|bunny fucker|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|clitoris|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cokmuncher|coksucka|cumshot|cunilingus|cunillingus|cunnilingus|cuntlick|cuntlicker|cuntlicking|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|dog-fucker|donkeyribber|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fagging|faggitt|faggot|faggs|fagot|fagots|fannyflaps|fannyfucker|fatass|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|fuck|fucka|fucked|fucker|fuckers|kghckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fukker|fukkin|fukwhit|fukwit|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|goatse|hardcoresex|horniest|horny|hotsex|jack-off|jackoff|jerk-off|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat|masterbat3|masterbate|masterbation|masterbations|masturbate|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muthafecker|muthafuckker|mutherfucker|n1gga|n1gger|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob jokey|nobjocky|nobjokey|nutsack|p0rn|pecker|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|pissflaps|schlong|smegma|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tw4t|twathead|twatty|twunt|twunter|v14gra|v1gra|w00se|a55|a55hole|aeolus|ahole|anal|analprobe|anilingus|arian|aryan|ass|assbang|assbanged|assbangs|asses|assfuck|assfucker|assh0le|asshat|assho1e|ass hole|assholes|assmaster|assmunch|asswipe|asswipes|azazel|azz|b1tch|babe|babes|ballsack|bastard|bastards|beaner|beardedclam|beastiality|beatch|beeyotch|beotch|biatch|bigtits|big tits|bimbo|bitch|bitched|bitches|bitchy|blow job|blowjob|blowjobs|boink|bollock|bollocks|bollok|boner|boners|bong|boob|boobies|boobs|booby|booger|bookie|bootee|booty|boozer|boozy|bosomy|brassiere|bugger|bullshit|bull shit|bullshits|bullshitted|bullturds|bung|busty|butt fuck|buttfuck|buttfucker|buttfucker|buttplug|c.0.c.k|c.o.c.k.|c.u.n.t|c0ck|c-0-c-k|caca|cahone|cameltoe|carpetmuncher|cawk|chinc|chincs|chode|chodes|cl1t|clit|clitoris|clitorus|clits|clitty|cocain|cock|c-o-c-k|cockblock|cockholster|cockknocker|cocks|cocksmoker|cocksucker|cock sucker|coital|commie|condom|coon|coons|corksucker|crackwhore|crap|crappy|cum|cummin|cumming|cumshot|cumshots|cumslut|cumstain|cunilingus|cunnilingus|cunny|cunt|cunt|c-u-n-t|cuntface|cunthunter|cuntlick|cuntlicker|cunts|d0ng|d0uch3|d0uche|d1ck|d1ld0|d1ldo|dago|dagos|dawgie-style|dick|dickbag|dickdipper|dickface|dickflipper|dickhead|dickheads|dickish|dick-ish|dickripper|dicksipper|dickweed|dickwhipper|dickzipper|dike|dildo|dildos|diligaf|dillweed|dimwit|dingle|dipship|doggie-style|doggy-style|dong|doofus|doosh|dopey|douch3|douche|douchebag|douchebags|douchey|dumass|dumbass|dumbasses|dyke|dykes|ejaculate|erect|erection|erotic|essohbee|extacy|extasy|f.u.c.k|fack|fag|fagg|fagged|faggit|faggot|fagot|fags|faig|faigt|fannybandit|fartknocker|felch|felcher|felching|fellate|fellatio|feltch|feltcher|fisted|fisting|fisty|foad|fondle|foreskin|freex|frigg|frigga|fubar|fuck|f-u-c-k|fuckass|fucked|fucked|fucker|fuckface|fuckin|fucking|fucknugget|fucknut|fuckoff|fucks|fucktard|fuck-tard|fuckup|fuckwad|fuckwit|fudgepacker|fuk|fvck|fxck|gae|gai|ganja|gfy|ghay|ghey|gigolo|glans|goatse|goldenshowers|gook|gooks|gspot|g-spot|gtfo|guido|h0m0|h0mo|handjob|hard on|he11|hebe|heeb|herp|herpy|hobag|hom0|homey|homoey|honky|hooch|hookah|hooker|hoor|hootch|hooter|hooters|horny|hump|humped|humping|hussy|hymen|injun|j3rk0ff|jackass|jackhole|jackoff|jap|japs|jerk|jerk0ff|jerked|jerkoff|jism|jiz|jizm|jizz|jizzed|junkie|junky|kike|kikes|kinky|kkk|klan|knobend|kooch|kooches|kootch|kraut|kyke|labia|lech|leper|lesbo|lesbos|lez|lezbo|lezbos|lezzie|lezzies|lezzy|loin|loins|lube|lusty|mams|massa|masterbate|masterbating|masterbation|masturbate|masturbating|masturbation|m-fucking|mofo|molest|moolie|moron|motherfucka|motherfucker|motherfucking|mtherfucker|mthrfucker|mthrfucking|muff|muffdiver|murder|muthafuckaz|muthafucker|mutherfucker|mutherfucking|muthrfucking|nad|nads|napalmsm|negro|nigga|niggah|niggas|niggaz|nigger|nigger|niggers|niggle|niglet|nimrod|ninny|nooky|nympho|orgasmic|orgies|orgy|p.u.s.s.y.|paddy|paki|pantie|panties|panty|pastie|pasty|pcp|pecker|pedo|pedophile|pedophilia|pedophiliac|peepee|penial|penile|phuck|pillowbiter|pinko|pissoff|piss-off|pms|polack|pollock|poon|poontang|porn|porno|pornography|prick|prig|prostitute|prude|pube|pubic|punkass|punky|puss|pussies|pussy|pussypounder|puto|queaf|queef|queef|queero|quicky|quim|rape|raped|raper|rapist|reefer|reetard|reich|retard|retarded|rimjob|ritard|rtard|r-tard|rump|rumprammer|ruski|s.h.i.t.|s.o.b.|s0b|sadism|sadist|scag|schizo|schlong|scrog|scrot|scrote|scrud|sh1t|s-h-1-t|shamedame|shit|s-h-i-t|shite|shiteater|shitface|shithead|shithole|shithouse|shits|shitt|shitted|shitter|shitty|shiz|sissy|skag|skank|slut|slutdumper|slutkiss|sluts|smegma|smut|smutty|s-o-b|sodom|souse|soused|spic|spick|spik|spiks|spooge|spunk|stfu|stiffy|sumofabiatch|t1t|tard|tawdry|teabagging|teat|terd|thug|tit|titfuck|titi|tits|tittiefucker|titties|titty|tittyfuck|tittyfucker|toke|toots|tramp|transsexual|tubgirl|turd|tush|twat|twats|undies|unwed|uzi|vag|valium|viagra|voyeur|wang|wank|wanker|wetback|wh0re|wh0reface|whitey|whoralicious|whore|whorealicious|whored|whoreface|whorehopper|whorehouse|whores|whoring|wigger|wtf|yobbo|zoophile)\b/gi

// Restrict access to have sessions on third party platforms
const SAFETY_RESTRICTION_REGEX = /\b(zoom.us|meet.google.com)\b/gi

export enum LangfuseTraceName {
  MODERATE_SESSION_MESSAGE = 'moderateSessionMessage',
  MODERATE_SESSION_TRANSCRIPT = 'moderateSessionTranscript',
  MODERATE_IMAGE = 'MODERATE_IMAGE',
}
export enum LangfuseGenerationName {
  SESSION_MESSAGE_MODERATION_DECISION = 'getModerationDecision',
  SESSION_TRANSCRIPT_MODERATION_DECISION = 'getSessionTranscriptModerationDecision',
  GET_ADDRESS_DETECTION_MODERATION_DECISION = 'getAddressDetectionModerationDecision',
  GET_QUESTIONABLE_LINK_MODERATION_DECISION = 'getQuestionableLinkModerationDecision',
  EXTRACT_TEXT_FROM_IMAGE = 'extractTextFromImage',
  DETECT_PII_IN_TEXT = 'detectPiiInText',
  DETECT_TOXICITY_IN_TEXT = 'detectToxicityInText',
  DETECT_MODERATION_LABELS = 'detectModerationLabels',
  DETECT_FACES = 'detectFaces',
  DETECT_PERSON = 'detectPerson',
  DETECT_MINORS = 'detectMinors',
  IS_IMAGE_EDUCATIONAL = 'isImageEducational',
}

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

type ImageModerationFailureReason = {
  reason: string
  /*
    Moderation labels from AWS Rekognition,
      - Weapons, Nudity, Violence, Drug use, etc...
  */
  details?: any
}

const topLevelCategoryFilter = (label: ModerationLabel) =>
  label.TaxonomyLevel === 1

const moderationLabelToFailureReason = (
  label: ModerationLabel
): ImageModerationFailureReason => {
  return {
    reason: label.Name ?? 'Unknown',
    details: { confidence: label.Confidence },
  }
}

export type ModerationSource =
  | 'image_upload'
  | 'screenshare'
  | 'audio_transcription'
  | 'text_chat'
  | 'whiteboard'

const DIRECT_MESSAGE_TAG = 'direct_message'
const MESSAGE_TAG = 'session_chat'
const WHITEBOARD_TEXT_TAG = 'whiteboard_text'

async function detectImageEducationPurpose(
  image: Buffer,
  sessionId: string,
  trace?: LangfuseTraceClient
): Promise<ImageModerationFailureReason | null> {
  try {
    const prompt = await getPromptData(
      LangfusePromptNameEnum.IS_IMAGE_EDUCATIONAL,
      ''
    )
    if (prompt.isFallback) throw Error("Couldn't get prompt")

    let generation: LangfuseGenerationClient | undefined = undefined
    if (trace) {
      generation = trace.generation({
        name: LangfuseGenerationName.IS_IMAGE_EDUCATIONAL,
        prompt: prompt.promptObject,
        model: config.awsBedrockSonnetArnId,
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
          required: ['detectLabels', 'reason'],
        },
      },
    ]

    const response: {
      detectedLabels: [{ label: string; confidence: number }]
      reason: string
    } = await invokeModel({
      modelId: config.awsBedrockSonnetArnId,
      image: image,
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
        reason: `"The image doesn't serve any educational purpose"`,
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
  trace?: LangfuseTraceClient
) {
  try {
    let generation: LangfuseGenerationClient | undefined = undefined

    if (trace) {
      generation = trace.generation({
        name: LangfuseGenerationName.DETECT_PERSON,
      })
    }

    const labelResponse = await awsRekognitionClient.send(
      new DetectLabelsCommand({
        Image: {
          Bytes: image as Uint8Array,
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
    const labelFailures = labels.map((label) => ({
      reason: `Person detected in image`,
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
  trace?: LangfuseTraceClient,
  sessionId?: string
) {
  try {
    let generation: LangfuseGenerationClient | undefined = undefined
    if (trace) {
      generation = trace.generation({
        name: LangfuseGenerationName.DETECT_MODERATION_LABELS,
      })
    }

    const moderationLabelsResponse = await awsRekognitionClient.send(
      new DetectModerationLabelsCommand({
        Image: {
          Bytes: image,
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
      .map(moderationLabelToFailureReason)
  } catch (err) {
    logger.error({ sessionId, err }, 'Failed to moderate image')
    throw new Error(`Failed to moderate image for session ${sessionId}`)
  }
}

/*
  determine if image depicts a minor
*/
async function detectMinorFailures(image: Buffer, trace?: LangfuseTraceClient) {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: LangfuseGenerationName.DETECT_FACES,
    })
  }
  const facesResponse = await awsRekognitionClient.send(
    new DetectFacesCommand({
      Image: {
        Bytes: image,
      },
      Attributes: ['AGE_RANGE'],
    })
  )
  if (generation) {
    generation.end({ output: facesResponse })
  }
  const faces = facesResponse.FaceDetails ?? []
  const faceFailures = faces
    .filter(
      (face) => face.AgeRange?.Low && face.AgeRange?.Low < MINOR_AGE_THRESHOLD
    )
    .map((face) => ({
      reason: `Minor detected in image`,
      details: {
        ageRange: face.AgeRange,
        confidence: face.Confidence,
      },
    }))

  if (faceFailures.length > 0) {
    return faceFailures
  }

  // DetectFaces seems to be more accurate when it comes to detecting minors
  // but we want to handle the case where faces are not in the image
  if (trace) {
    generation = trace.generation({
      name: LangfuseGenerationName.DETECT_MINORS,
    })
  }
  const labelResponse = await awsRekognitionClient.send(
    new DetectLabelsCommand({
      Image: {
        Bytes: image,
      },
      MinConfidence: config.imageModerationMinConfidence,
      Settings: {
        GeneralLabels: {
          LabelInclusionFilters: ['Teen', 'Girl', 'Boy', 'Child'],
        },
      },
    })
  )
  if (generation) {
    generation.end({ output: labelResponse })
  }
  const labels = labelResponse.Labels ?? []
  const labelFailures = labels.map((label) => ({
    reason: `Minor detected in image`,
    details: {
      label: label.Name,
      confidence: label.Confidence,
    },
  }))

  return labelFailures
}

export async function extractTextFromImage(
  image: Buffer,
  trace?: LangfuseTraceClient
) {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: LangfuseGenerationName.EXTRACT_TEXT_FROM_IMAGE,
    })
  }

  const extractedText = await awsRekognitionClient.send(
    new DetectTextCommand({
      Image: {
        Bytes: image,
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
  trace?: LangfuseTraceClient
) => {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: LangfuseGenerationName.DETECT_TOXICITY_IN_TEXT,
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

  const highToxicity = toxicContent
    .filter(
      ({ result }) =>
        result.Toxicity &&
        result.Toxicity >= config.toxicityModerationMinConfidence
    )
    .map(({ result, text }) => ({
      reason: 'High Toxicity',
      details: {
        toxicity: result.Toxicity,
        text,
        labels: result.Labels,
      },
    }))

  return highToxicity
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
    PHONE_REGEX.test(entityText)

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

  return aiModerationResult?.isPhoneNumber ?? true
}

function existsInArray(array: any[], item: any) {
  return array.some((i) => i === item)
}

export type ModeratedLink = {
  reason: 'Link'
  details: {
    text: string
    confidence: number
    policyNames?: string[]
    explanation?: string
  }
}

type ModeratedAddress = {
  reason: 'Address'
  details: { text: string; confidence: number; explanation?: string }
}

export type ModeratedEmail = {
  reason: 'Email'
  details: { text: string; confidence: number }
}

export type ModeratedPhone = {
  reason: 'Phone'
  details: { text: string; confidence: number }
}

export type ModeratedPII =
  | ModeratedLink
  | ModeratedEmail
  | ModeratedPhone
  | ModeratedAddress

const meetsOrExceedsLinkConfidenceThreshold = (
  link: Pick<ModeratedLink, 'details'>
) => link.details.confidence >= Number(config.minimumModerationLinkConfidence)

export function filterDisallowedDomains({
  allowedDomains,
  links,
}: {
  allowedDomains: string[]
  links: ModeratedLink[]
}): ModeratedLink[] {
  const linksWithDisallowedDomain = (link: ModeratedLink) =>
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
  reason: 'Address'
  details: { text: string; confidence: number; explanation: string }
} | null> {
  const modelId = config.awsBedrockHaikuId

  const promptData = await getPromptData(
    LangfusePromptNameEnum.GET_ADDRESS_DETECTION_MODERATION_DECISION,
    ADDRESS_DETECTION_FALLBACK_MODERATION_PROMPT
  )

  const t = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
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
    name: LangfuseGenerationName.GET_ADDRESS_DETECTION_MODERATION_DECISION,
    model: modelId,
    input: { text },
    // Attach prompt object, if it exists, in order to associate the generation with the prompt in LF
    ...(promptData.promptObject && { prompt: promptData.promptObject }),
  })
  try {
    const completion = await invokeModel({
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
        reason: 'Address',
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

type ModeratedLinkResponse = {
  reason: 'Link'
  details: {
    links: Array<{
      link: string
      details: {
        confidence: number
        policyNames: string[]
        explanation: string
      }
    }>
  }
}

async function checkForQuestionableLinks({
  links,
  sessionId,
}: {
  links: ModeratedLink[]
  sessionId: string
}): Promise<ModeratedLinkResponse | null> {
  const modelId = config.awsBedrockHaikuId

  const promptData = await getPromptData(
    LangfusePromptNameEnum.GET_QUESTIONABLE_LINK_MODERATION_DECISION,
    QUESTIONABLE_LINK_FALLBACK_MODERATION_PROMPT
  )

  const t = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    sessionId,
  })

  const formattedLinks = links
    .map((link) => `<link>${link.details.text}</link>`)
    .join(' ')

  const gen = t.generation({
    name: LangfuseGenerationName.GET_QUESTIONABLE_LINK_MODERATION_DECISION,
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
    const completion = await invokeModel({
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
        reason: 'Link',
        details: completion satisfies ModeratedLinkResponse['details'],
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
  trace?: LangfuseTraceClient
) {
  let generation: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    generation = trace.generation({
      name: LangfuseGenerationName.DETECT_PII_IN_TEXT,
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

  const links: ModeratedLink[] = []
  const emails: ModeratedEmail[] = []
  const phones: ModeratedPhone[] = []
  const addresses: ModeratedAddress[] = []
  for (const entity of entities) {
    const entityStart = entity.BeginOffset
    const entityEnd = entity.EndOffset
    const entityText = text.slice(entityStart, entityEnd)
    const entityConfidence = Number(entity.Score)

    if (entity.Type === 'URL' && !existsInArray(links, entityText)) {
      links.push({
        reason: 'Link',
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    } else if (
      entity.Type === 'EMAIL' &&
      !existsInArray(emails, entityText) &&
      entityConfidence >= config.emailModerationConfidenceThreshold
    ) {
      emails.push({
        reason: 'Email',
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
        reason: 'Phone',
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
        reason: 'Address',
        details: {
          text: entityText,
          confidence: entityConfidence,
        },
      })
    }
  }

  const moderatedPII: ModeratedPII[] = [...emails, ...phones]

  const allowedDomains = await ShareableDomainsRepo.getAllowedDomains()
  const moderatedLinks = (
    await filterDisallowedDomains({
      allowedDomains,
      links,
    })
  ).filter(meetsOrExceedsLinkConfidenceThreshold)

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
              reason: 'Link',
              details: {
                text: link.link,
                confidence: link.details.confidence,
                policyNames: link.details.policyNames,
                explanation: link.details.explanation,
              },
            }) as ModeratedLink
        )
        .filter(meetsOrExceedsLinkConfidenceThreshold)

      moderatedPII.push(...moderatedQuestionableLinks)
    }
  }

  if (addresses.length > 0) {
    const moderatedAddress = await checkForFullAddresses({ text, sessionId })

    if (
      moderatedAddress &&
      moderatedAddress?.details?.confidence >=
        config.minimumModerationAddressConfidence
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
  trace?: LangfuseTraceClient
) {
  const textSegments = await extractTextFromImage(image, trace)

  if (textSegments.length === 0) {
    return []
  }

  const [toxicity, pii] = await Promise.all([
    detectToxicContent(textSegments, trace),
    detectPii(textSegments.join(' '), sessionId, isVolunteer, trace),
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
    ModerationSource,
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
}: {
  userId: string
  sessionId: string
  failureReasons: ImageModerationFailureReason[]
  image: Buffer
  source: Extract<
    ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
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
      ImageModerationFailureReason['reason'],
      ImageModerationFailureReason['details']
    >
  )

  await handleModerationInfraction(userId, sessionId, { failures }, source)
}

function maybeHandleImageModerationFailure(options: {
  userId: string
  sessionId: string
  image: Buffer
  source: Extract<
    ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
}) {
  return function (failures: ImageModerationFailureReason[]) {
    if (failures.length > 0) {
      handleImageModerationFailure({
        userId: options.userId,
        sessionId: options.sessionId,
        failureReasons: failures,
        image: options.image,
        source: options.source,
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
export function moderateImageInBackground(options: {
  image: Buffer
  sessionId: string
  userId: string
  isVolunteer: boolean
  source: Extract<
    ModerationSource,
    'screenshare' | 'image_upload' | 'whiteboard'
  >
  trace?: LangfuseTraceClient
}): void {
  detectImageModerationFailures(
    options.image,
    options.trace,
    options.sessionId
  ).then(maybeHandleImageModerationFailure(options))

  detectMinorFailures(options.image, options.trace).then(
    maybeHandleImageModerationFailure(options)
  )

  detectTextModerationFailures(
    options.image,
    options.sessionId,
    options.isVolunteer,
    options.trace
  ).then(maybeHandleImageModerationFailure(options))
}

async function getAllImageModerationFailures({
  image,
  sessionId,
  isVolunteer,
  trace,
}: {
  image: Buffer
  sessionId: string
  isVolunteer: boolean
  trace?: LangfuseTraceClient
}): Promise<{
  failureReasons: ImageModerationFailureReason[]
}> {
  const [
    moderationFailureReasons,
    minorFailures,
    textModerationFailureReasons,
    detectPersonResponse,
  ] = await Promise.all([
    detectImageModerationFailures(image, trace, sessionId),
    detectMinorFailures(image, trace),
    detectTextModerationFailures(image, sessionId, isVolunteer, trace),
    detectPersonInImage(image, sessionId, trace),
  ])

  if (
    isEmpty(moderationFailureReasons) &&
    isEmpty(minorFailures) &&
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
      ...minorFailures,
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
    LangfusePromptNameEnum.GET_SESSION_MESSAGE_MODERATION_DECISION,
    FALLBACK_MODERATION_PROMPT
  )

  let gen: LangfuseGenerationClient | undefined = undefined
  if (trace) {
    gen = trace.generation({
      name: LangfuseGenerationName.SESSION_MESSAGE_MODERATION_DECISION,
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
  promptName: LangfusePromptNameEnum,
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
    await QueueService.add(
      Jobs.ModerateSessionMessage,
      {
        censoredSessionMessage,
        isVolunteer,
      },
      { removeOnComplete: true, removeOnFail: true }
    )
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

export type RegexModerationResult = {
  isClean: boolean
  failures: ModerationFailureReasons
  sanitizedMessage: string
}

const regexModerate = (message: string): RegexModerationResult => {
  const failedTests = [
    ['email', test({ regex: EMAIL_REGEX, message })],
    ['phone', test({ regex: PHONE_REGEX, message })],
    ['profanity', test({ regex: PROFANITY_REGEX, message })],
    ['safety', test({ regex: SAFETY_RESTRICTION_REGEX, message })],
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

export type ModerationAIResult = {
  message: string
  appropriate: boolean
  reasons: Record<string, string[] | never>
}

export type ModerationFailureReasons = {
  failures: Record<string, string[] | never>
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
}): Promise<oldClientModerationResult | ModerationFailureReasons> {
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
      name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
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

      const results: ModerationAIResult | undefined =
        response?.results as ModerationAIResult
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
    name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
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
  const uncleanDms = transcriptModerationResults.flaggedMessages.filter(
    (message) => message.includes(DIRECT_MESSAGE_TAG)
  )
  if (uncleanDms.length) {
    const failures = {} as Record<string, string[]>
    transcriptModerationResults.reasons.forEach((reason) => {
      failures[reason.toLowerCase().replace('_', ' ')] = []
    })
    return { failures }
  } else {
    return { failures: {} }
  }
}

export const handleModerationInfraction = async (
  userId: string,
  sessionId: string,
  reasons:
    | ModerationFailureReasons
    | Record<
        ImageModerationFailureReason['reason'],
        ImageModerationFailureReason['details']
      >,
  source: ModerationSource,
  client = getClient()
) => {
  if (source === 'image_upload') {
    // Image uploads are premoderated, so if they fail moderation they are not shown to any user.
    // Therefore there is no need to write an infraction, which represents a retroactive strike for an offense.
    return
  }
  const insertedInfraction =
    await ModerationInfractionsRepo.insertModerationInfraction(
      {
        userId,
        sessionId,
        reason: reasons.failures,
      },
      client
    )
  const allActiveInfractions =
    await ModerationInfractionsRepo.getModerationInfractionsByUser(
      userId,
      {
        active: true,
        sessionId,
      },
      client
    )
  const infractionScore = weighSessionInfractions(allActiveInfractions)
  const streamStoppingReasons = getStreamStoppingReasonsFromInfractions([
    insertedInfraction,
  ])
  const doLiveMediaBan =
    infractionScore >= config.liveMediaBanInfractionScoreThreshold
  const socketService = await SocketService.getInstance()
  if (doLiveMediaBan) {
    await UsersRepo.banUserById(
      userId,
      USER_BAN_TYPES.LIVE_MEDIA,
      USER_BAN_REASONS.AUTOMATED_MODERATION
    )
    await socketService.emitUserLiveMediaBannedEvents(userId, sessionId)
    logger.info(
      { userId, sessionId, infractionId: insertedInfraction.id },
      'Live media banned user'
    )
  }

  const failures: string[] = [...new Set<string>(Object.keys(reasons.failures))]

  await socketService.emitModerationInfractionEvent(userId, {
    isBanned: doLiveMediaBan,
    infraction: failures,
    source,
    occurredAt: new Date(),
    stopStreamImmediately: doLiveMediaBan || streamStoppingReasons.length > 0,
    stopStreamImmediatelyReasons: streamStoppingReasons,
  })
}

export type LiveMediaModerationCategories =
  | 'profanity'
  | 'violence'
  | 'link'
  | 'address'
  | 'minor detected in image'
  | 'email'
  | 'phone'
  | 'high toxicity'
  | 'swimwear or underwear'
  | 'explicit'
  | 'non-explicit nudity of intimate parts and kissing'
  | 'visually disturbing'
  | 'drugs & tobacco'
  | 'alcohol'
  | 'rude gestures'
  | 'gambling'
  | 'hate symbols'

/**
 * This gets the score/weight for the severity of the moderation infraction.
 * We have a configurable threshold for the max score you can accrue before being
 * live media-banned - see {@link config.liveMediaBanInfractionScoreThreshold}
 * @param category
 */
export function getScoreForCategory(
  category: LiveMediaModerationCategories | string
): number {
  let categoryScore
  switch (category.toLowerCase()) {
    case 'profanity':
    case 'high toxicity':
    case 'drugs & tobacco':
    case 'alcohol':
    case 'rude gestures':
    case 'gambling':
      categoryScore = 1
      break
    case 'violence':
    case 'swimwear or underwear':
    case 'explicit':
    case 'non-explicit nudity of intimate parts and kissing':
    case 'hate symbols':
    case 'visually disturbing':
      categoryScore = 10
      break
    case 'link':
    case 'email':
    case 'phone':
    case 'address':
    case 'minor detected in image':
      categoryScore = 4
      break
  }
  if (!categoryScore) {
    logger.error(
      `Missing score for infraction category ${category}. Defaulting to severe score.`
    )
    categoryScore = 10
  }
  return categoryScore
}

export function isStreamStoppingReason(
  category: LiveMediaModerationCategories | string
): boolean {
  const streamStoppingReasons = [
    'minor detected in image',
    'swimwear or underwear',
    'violence',
    'visually disturbing',
    'hate symbols',
    'link',
    'email',
    'phone',
    'address',
    'explicit',
    'non-explicit nudity of intimate parts and kissing',
  ]
  return streamStoppingReasons.includes(category.toLowerCase())
}

function getReasonsFromInfractions(
  infractions: ModerationInfraction[]
): string[] {
  return infractions.flatMap((i) => Object.keys(i.reason))
}

export function weighSessionInfractions(
  infractions: ModerationInfraction[]
): number {
  const reasons = getReasonsFromInfractions(infractions)
  return reasons.reduce((acc, current) => {
    const categoryScore = getScoreForCategory(current)
    return acc + categoryScore
  }, 0)
}

export function getStreamStoppingReasonsFromInfractions(
  infractions: ModerationInfraction[]
): string[] {
  const reasons = getReasonsFromInfractions(infractions)
  return reasons.filter((reason) => isStreamStoppingReason(reason))
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
  source: ModerationSource
}): Promise<
  CleanTranscriptModerationResult | SanitizedTranscriptModerationResult
> => {
  const { isClean, failures, sanitizedMessage } = regexModerate(transcript)
  if (isClean) return { isClean: true } as CleanTranscriptModerationResult
  // @TODO - run through AI moderation

  // If the message is unclean, track it as an infraction against the user
  await handleModerationInfraction(userId, sessionId, failures, source)
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
    ModerationSource,
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
          name: LangfuseTraceName.MODERATE_IMAGE,
          metadata: {
            sessionId,
            isVolunteer,
            source,
            userId,
          },
        })
      : undefined
  if (aggregateInfractions) {
    const result = await getAllImageModerationFailures({
      image,
      sessionId,
      isVolunteer,
      trace: traceClient,
    })
    if (isEmpty(result.failureReasons)) return { isClean: true, failures: [] }

    if (recordInfractions) {
      await handleImageModerationFailure({
        userId,
        sessionId,
        failureReasons: result.failureReasons,
        image,
        source,
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
    moderateImageInBackground({
      image,
      sessionId,
      userId,
      isVolunteer,
      source,
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
    name: LangfuseGenerationName.SESSION_TRANSCRIPT_MODERATION_DECISION,
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

export type ModerationSessionReviewFlagReason =
  | 'PII'
  | 'HATE_SPEECH'
  | 'PLATFORM_CIRCUMVENTION'
  | 'INAPPROPRIATE_CONTENT'
  | 'SAFETY'
  | 'N/A'
export type TranscriptChunkModerationResult = {
  confidence: number // higher = more likely to be inappropriate
  explanation: string
  reasons: ModerationSessionReviewFlagReason[]
  flaggedMessages: string[]
}
export const moderateTranscript = async (
  transcript: SessionTranscript,
  trace: LangfuseTraceClient,
  extractedText?: string[]
): Promise<{
  reasons: ModerationSessionReviewFlagReason[]
  flaggedMessages: string[]
}> => {
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
    LangfusePromptNameEnum.SESSION_TRANSCRIPT_MODERATION,
    FALLBACK_TRANSCRIPT_MODERATION_PROMPT
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
  if (
    results.some(
      (r) => r.confidence >= config.contextualModerationConfidenceThreshold
    )
  ) {
    trace.update({ tags: [LangfuseTraceTagEnum.FLAGGED_BY_MODERATION] })
  }

  const confidenceThreshold = config.contextualModerationConfidenceThreshold
  const flaggedChunks = results.filter(
    (chunk) => chunk.confidence >= confidenceThreshold
  )
  const flagReasons = new Set<ModerationSessionReviewFlagReason>(
    flaggedChunks.flatMap((chunk) => chunk.reasons)
  )
  return {
    reasons: Array.from(flagReasons),
    flaggedMessages: flaggedChunks.flatMap((chunk) => chunk.flaggedMessages),
  }
}

export function getSessionFlagByModerationReason(
  reason: ModerationSessionReviewFlagReason | string
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

export async function markSessionForReview(
  sessionId: string,
  sessionFlags: UserSessionFlags[],
  tc: TransactionClient = getClient()
): Promise<void> {
  await runInTransaction(async (tc: TransactionClient) => {
    await updateSessionFlagsById(sessionId, sessionFlags, tc)
    await updateSessionReviewReasonsById(sessionId, sessionFlags, false, tc)
  }, tc)
}

export const FALLBACK_MODERATION_PROMPT = `
You are moderating a chat room conversation between a student and an adult tutor. You are responsible for flagging inappropriate messages. Messages are delimited by XML tags, either <student> for messages sent by the the student or <tutor> for messages sent by the adult tutor.

When flagging a message, consider just the message in the XML tag.

Exceptions to what are considered harmful are delimited by the XML tag <exceptions>. Messages that meet the exception criteria should not be flagged.

For each message provided, please provide a JSON array response where the form of each element is delimited by triple quotes:

"""
{

  message: string,

  appropriate: boolean,

  reasons: Map<reason, offendingSubstring[]>

}
"""

where 'message' is the message provided between XML tags, 'appropriate' is a decision on if the message is appropriate, and 'reasons' is a map that associates each inappropriate substring with their reason.

Acceptable values for the elements of the 'reasons' array are:
- "profanity" - Use this reason when the message is inappropriate due to profanity.
- "hateful_language" - Use this reason when the message is inappropriate due to hateful language.
- "email" - Use this reason when the message is inappropriate because it includes an email address
- "phone" - Use this reason when the message is inappropriate because it includes a phone number
- "other_contact_info" - Use this reason when the message is inappropriate because it includes other forms of contact information, such as social media handles, hints to a participant's physical location, etc
- "safety" - Use this reason when the message is inappropriate because it includes plans for the chat participants to communicate outside of this platform, or indicates other potential for harm.
- "other" - Use this reason as a catch-all for anything else you think is inappropriate for an adult to share with a minor or vice-a-versa


<exceptions>
- Links to common text-based collaboration tools (like Google Docs) that are shared for the purpose of reviewing school assignments
- Direct quotes from literature
- Profanity that is likely just a typo. In this event, prefer flagging the message as appropriate instead of inappropriate if and only if the context of the message indicates it was likely a mistake.
</exceptions>`

const FALLBACK_TRANSCRIPT_MODERATION_PROMPT = `
You are a Trust & Safety expert. Your job is to review a tutoring conversation between a student and volunteer tutor on a platform called UPchieve and decide if it violates any policies. The platform has built-in support for written chat messages, voice chat, and collaborative document editor and whiteboard.
You will find the message in <message> tags and the role of the user who sent the message in the <role> tags. Messages are either written chat messages, messages written on a whiteboard (and tagged with <whiteboard_text>), or transcriptions of voice chat, all of which are built into the platform. Users may message each other after the end of the tutoring session for continuous asynchronous tutoring help. These messages are in <direct_message> or <whiteboard_text> tags.
Policies are described in the <policy> tags, and each has a name to be returned in your JSON response in the <name> tag. Exceptions to the policies are in <exception> tags.
Given a chunk of the conversation, provide a confidence rating from 0 to 100 to quantify your confidence that the conversation is inappropriate, where 100 means maximally confident that the conversation is inappropriate.
<policy><name>HATE_SPEECH</name>No hate speech</policy>
<policy><name>INAPPROPRIATE_CONTENT</name>No sexual or flirtatious content</policy>
<policy><name>PLATFORM_CIRCUMVENTION</name>No circumventing the platform by communicating outside of it OR expressing intent to. This includes sharing contact information such as email addresses, usernames for other apps, phone numbers, etc.
<exception>Links to external collaborative editors (e.g. whiteboards and document editors) are OK as long as they are shared with the intent of facilitating tutoring AND used in a read-only capacity; all work must be done on the platform.</exception>
<exception>The platform has its own direct messaging feature that is an appropriate mode of communication as long as the intended use is still to facilitate tutoring.</exception>
<exception>It is acceptable to agree on a time to meet to do another tutoring session as long as it is on the platform.</exception>
</policy>
<policy><name>PII</name>No sharing personally identifiable information such as one's school, place of employment, address, contact information, etc.
<exception>Grade level and first names are already known to both participants.</exception>
<exception>If the tutoring session is focused on college applications and college essays, it is appropriate to share information about the college or minor personal information if it is relevant to the student's applications. NO contact information should be shared, nor the student's school.</exception>
</policy>
<policy><name>SAFETY</name>Threats of harm to oneself or others and dangerous situations should be flagged.</policy>
Provide your response in this JSON format: "{ confidence: number, explanation: string, reasons: string[], flaggedMessages: string[] }". If you have a confidence of 0, your explanation should be an empty string and the reasons and flaggedMessages properties should be empty arrays. Otherwise, reasons should be the names of all violated policies and flaggedMessages should be the exact messages that violate the policies (including their original tags).
`

const ADDRESS_DETECTION_FALLBACK_MODERATION_PROMPT = `
You are a Trust & Safety expert. Your job is to review the text extracted from an image that was shared between a student and volunteer tutor and decide if it contains an address.
You will find the extracted text in <text> tags.
Given the text, provide a confidence rating from 0 to 1 (to 3 decimal places) that the text contains an address, where 1 means maximally confident that the text contains an address of the student, tutor, or a place they might meet in person.
Provide your response in this JSON format: "{ confidence: number, explanation: string }"
`

const QUESTIONABLE_LINK_FALLBACK_MODERATION_PROMPT = `
You are a Trust & Safety expert. Your job is to review the links extracted from an image that was shared between a student and volunteer tutor during a tutoring session and decide if the links in question are appropriate to be shared.
The tutoring session is on a platform called UPchieve which allows users to share their screen and upload images.

Policies are listed below in <policy> tags and named in the <name> tag:
<policy><name>INAPPROPRIATE_CONTENT</name>Links to pornographic or sexually explicit content</policy>
<policy><name>INAPPROPRIATE_CONTENT</name>Links to illegal or illicit content</policy>
<policy><name>HATE_SPEECH</name>Links to hate speech or hate groups</policy>
<policy><name>SAFETY</name>Links to self-harm or suicide content</policy>
<policy><name>SAFETY</name>Links to violence or weapons content</policy>
<policy><name>SAFETY</name>Links to drugs or drug paraphernalia</policy>
<policy><name>SOCIAL_MEDIA</name>Links to social media platforms such as instagram.com, facebook.com, x.com, etc.</policy>
<policy><name>PLATFORM_CIRCUMVENTION</name>Links that facilitate communication outside of the platform (such as zoom.us, meet.google.com, etc.)</policy>
<policy><name>OTHER</name>Links that fall outside of the above categories but would be considered inappropriate to share between an adult and a minor</policy>

The extracted links are delimited by <link> tags.

Given the links, provide a confidence rating from 0 to 1 (to 3 decimal places) that the links are inappropriate to be shared, where 1 means maximally confident that the links is inappropriate to be shared.
Provide your response in this JSON format: "{ links: [{ link: string, details: { confidence: number, policyNames: string[], explanation: string } }]"
`
