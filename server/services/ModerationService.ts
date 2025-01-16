import logger from '../logger'
import { chunk } from 'lodash'
import {
  CensoredSessionMessage,
  CENSORED_BY,
  createCensoredMessage,
} from '../models/CensoredSessionMessage'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'
import { openai } from './BotsService'
import * as UsersRepo from '../models/User/queries'
import {
  AI_MODERATION_STATE,
  getAiModerationFeatureFlag,
} from './FeatureFlagService'
import { timeLimit } from '../utils/time-limit'
import * as LangfuseService from './LangfuseService'
import { TextPromptClient } from 'langfuse-core'
import { LangfusePromptNameEnum } from './LangfuseService'
import SocketService from './SocketService'
import ContentSafetyClient, {
  AnalyzeImage200Response,
  AnalyzeImageDefaultResponse,
} from '@azure-rest/ai-content-safety'
import { AzureKeyCredential } from '@azure/core-auth'
import config from '../config'
import { InputError } from '../models/Errors'
import * as ModerationInfractionsRepo from '../models/ModerationInfractions/queries'
import { USER_BAN_REASONS, USER_BAN_TYPES } from '../constants'
import { SessionTranscript, SessionTranscriptItem } from '../models/Session'
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  ModerationLabel,
  DetectLabelsCommand,
  DetectFacesCommand,
  DetectTextCommand,
} from '@aws-sdk/client-rekognition'
import {
  ComprehendClient,
  DetectPiiEntitiesCommand,
  DetectToxicContentCommand,
} from '@aws-sdk/client-comprehend'
import crypto from 'crypto'
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { putObject } from './AwsService'

const MINOR_AGE_THRESHOLD = 18
import { LangfuseTraceClient } from 'langfuse-node'

// EMAIL_REGEX checks for standard and complex email formats
// Ex: yay-hoo@yahoo.hello.com
const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi

// PHONE_REGEX checks for 7/10 digit phone numbers with/out punctuation, not surrounded by other numbers
const PHONE_REGEX = /([^\d]|^)(\+\d{1,2}\s)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}([^\d]|$)/g

// PROFANITY_REGEX - Google's list of common bad words
const PROFANITY_REGEX = /\b(4r5e|5h1t|5hit|a55s|ass-fucker|assfucker|assfukka|a_s_s|b!tch|b00bs|b17ch|b1tch|ballsack|beastial|beastiality|bestiality|blow job|blowjob|blowjobs|boiolas|booooooobs|bunny fucker|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|clitoris|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cokmuncher|coksucka|cumshot|cunilingus|cunillingus|cunnilingus|cuntlick|cuntlicker|cuntlicking|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|dog-fucker|donkeyribber|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fagging|faggitt|faggot|faggs|fagot|fagots|fannyflaps|fannyfucker|fatass|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|fuck|fucka|fucked|fucker|fuckers|kghckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fukker|fukkin|fukwhit|fukwit|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|goatse|hardcoresex|horniest|horny|hotsex|jack-off|jackoff|jerk-off|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat|masterbat3|masterbate|masterbation|masterbations|masturbate|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muthafecker|muthafuckker|mutherfucker|n1gga|n1gger|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob jokey|nobjocky|nobjokey|nutsack|p0rn|pecker|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|pissflaps|schlong|smegma|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tw4t|twathead|twatty|twunt|twunter|v14gra|v1gra|w00se|a55|a55hole|aeolus|ahole|anal|analprobe|anilingus|arian|aryan|ass|assbang|assbanged|assbangs|asses|assfuck|assfucker|assh0le|asshat|assho1e|ass hole|assholes|assmaster|assmunch|asswipe|asswipes|azazel|azz|b1tch|babe|babes|ballsack|bastard|bastards|beaner|beardedclam|beastiality|beatch|beeyotch|beotch|biatch|bigtits|big tits|bimbo|bitch|bitched|bitches|bitchy|blow job|blowjob|blowjobs|boink|bollock|bollocks|bollok|boner|boners|bong|boob|boobies|boobs|booby|booger|bookie|bootee|booty|boozer|boozy|bosomy|brassiere|bugger|bullshit|bull shit|bullshits|bullshitted|bullturds|bung|busty|butt fuck|buttfuck|buttfucker|buttfucker|buttplug|c.0.c.k|c.o.c.k.|c.u.n.t|c0ck|c-0-c-k|caca|cahone|cameltoe|carpetmuncher|cawk|chinc|chincs|chode|chodes|cl1t|clit|clitoris|clitorus|clits|clitty|cocain|cock|c-o-c-k|cockblock|cockholster|cockknocker|cocks|cocksmoker|cocksucker|cock sucker|coital|commie|condom|coon|coons|corksucker|crackwhore|crap|crappy|cum|cummin|cumming|cumshot|cumshots|cumslut|cumstain|cunilingus|cunnilingus|cunny|cunt|cunt|c-u-n-t|cuntface|cunthunter|cuntlick|cuntlicker|cunts|d0ng|d0uch3|d0uche|d1ck|d1ld0|d1ldo|dago|dagos|dawgie-style|dick|dickbag|dickdipper|dickface|dickflipper|dickhead|dickheads|dickish|dick-ish|dickripper|dicksipper|dickweed|dickwhipper|dickzipper|dike|dildo|dildos|diligaf|dillweed|dimwit|dingle|dipship|doggie-style|doggy-style|dong|doofus|doosh|dopey|douch3|douche|douchebag|douchebags|douchey|dumass|dumbass|dumbasses|dyke|dykes|ejaculate|erect|erection|erotic|essohbee|extacy|extasy|f.u.c.k|fack|fag|fagg|fagged|faggit|faggot|fagot|fags|faig|faigt|fannybandit|fartknocker|felch|felcher|felching|fellate|fellatio|feltch|feltcher|fisted|fisting|fisty|foad|fondle|foreskin|freex|frigg|frigga|fubar|fuck|f-u-c-k|fuckass|fucked|fucked|fucker|fuckface|fuckin|fucking|fucknugget|fucknut|fuckoff|fucks|fucktard|fuck-tard|fuckup|fuckwad|fuckwit|fudgepacker|fuk|fvck|fxck|gae|gai|ganja|gfy|ghay|ghey|gigolo|glans|goatse|goldenshowers|gook|gooks|gspot|g-spot|gtfo|guido|h0m0|h0mo|handjob|hard on|he11|hebe|heeb|herp|herpy|hobag|hom0|homey|homoey|honky|hooch|hookah|hooker|hoor|hootch|hooter|hooters|horny|hump|humped|humping|hussy|hymen|injun|j3rk0ff|jackass|jackhole|jackoff|jap|japs|jerk|jerk0ff|jerked|jerkoff|jism|jiz|jizm|jizz|jizzed|junkie|junky|kike|kikes|kinky|kkk|klan|knobend|kooch|kooches|kootch|kraut|kyke|labia|lech|leper|lesbo|lesbos|lez|lezbo|lezbos|lezzie|lezzies|lezzy|loin|loins|lube|lusty|mams|massa|masterbate|masterbating|masterbation|masturbate|masturbating|masturbation|m-fucking|mofo|molest|moolie|moron|motherfucka|motherfucker|motherfucking|mtherfucker|mthrfucker|mthrfucking|muff|muffdiver|murder|muthafuckaz|muthafucker|mutherfucker|mutherfucking|muthrfucking|nad|nads|napalmsm|negro|nigga|niggah|niggas|niggaz|nigger|nigger|niggers|niggle|niglet|nimrod|ninny|nooky|nympho|orgasmic|orgies|orgy|p.u.s.s.y.|paddy|paki|pantie|panties|panty|pastie|pasty|pcp|pecker|pedo|pedophile|pedophilia|pedophiliac|peepee|penial|penile|phuck|pillowbiter|pinko|pissoff|piss-off|pms|polack|pollock|poon|poontang|porn|porno|pornography|prick|prig|prostitute|prude|pube|pubic|punkass|punky|puss|pussies|pussy|pussypounder|puto|queaf|queef|queef|queero|quicky|quim|rape|raped|raper|rapist|reefer|reetard|reich|retard|retarded|rimjob|ritard|rtard|r-tard|rump|rumprammer|ruski|s.h.i.t.|s.o.b.|s0b|sadism|sadist|scag|schizo|schlong|scrog|scrot|scrote|scrud|sh1t|s-h-1-t|shamedame|shit|s-h-i-t|shite|shiteater|shitface|shithead|shithole|shithouse|shits|shitt|shitted|shitter|shitty|shiz|sissy|skag|skank|slut|slutdumper|slutkiss|sluts|smegma|smut|smutty|s-o-b|sodom|souse|soused|spic|spick|spik|spiks|spooge|spunk|stfu|stiffy|sumofabiatch|t1t|tard|tawdry|teabagging|teat|terd|thug|tit|titfuck|titi|tits|tittiefucker|titties|titty|tittyfuck|tittyfucker|toke|toots|tramp|transsexual|tubgirl|turd|tush|twat|twats|undies|unwed|uzi|vag|valium|viagra|voyeur|wang|wank|wanker|wetback|wh0re|wh0reface|whitey|whoralicious|whore|whorealicious|whored|whoreface|whorehopper|whorehouse|whores|whoring|wigger|wtf|yobbo|zoophile)\b/gi

// Restrict access to have sessions on third party platforms
const SAFETY_RESTRICTION_REGEX = /\b(zoom.us|meet.google.com)\b/gi

enum LangfuseTraceName {
  MODERATE_SESSION_MESSAGE = 'moderateSessionMessage',
  MODERATE_SESSION_TRANSCRIPT = 'moderateSessionTranscript',
}
enum LangfuseGenerationName {
  SESSION_MESSAGE_MODERATION_DECISION = 'getModerationDecision',
  SESSION_TRANSCRIPT_MODERATION_DECISION = 'getSessionTranscriptModerationDecision',
}

// Image moderation
const AZURE_IMAGE_ANALYSIS_CATEGORY_SEVERITY_THRESHOLD = 2
const createAzureContentSafetyClient = () => {
  const credential = new AzureKeyCredential(config.azureContentSafetyApiKey)
  return ContentSafetyClient(config.azureContentSafetyBaseUrl, credential)
}

const azureContentSafetyClient = createAzureContentSafetyClient()

const AWS_CONFIG = {
  region: config.awsModerationToolsRegion,
  credentials: {
    accessKeyId: config.awsS3.accessKeyId,
    secretAccessKey: config.awsS3.secretAccessKey,
  },
}
const awsRekognitionClient = new RekognitionClient(AWS_CONFIG)
const awsComprehendClient = new ComprehendClient(AWS_CONFIG)

type VideoFrameModerationFailureReason = {
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
): VideoFrameModerationFailureReason => {
  return {
    reason: label.Name ?? 'Unknown - no label name from AWS',
    details: { confidence: label.Confidence },
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
async function detectImageModerationFailures(image: Buffer) {
  const moderationLabelsResponse = await awsRekognitionClient.send(
    new DetectModerationLabelsCommand({
      Image: {
        Bytes: image,
      },
      MinConfidence: config.imageModerationMinConfidence,
    })
  )
  const moderationLabels = moderationLabelsResponse.ModerationLabels ?? []
  return moderationLabels
    .filter(topLevelCategoryFilter)
    .map(moderationLabelToFailureReason)
}

/*
  determine if image depicts a minor
*/
async function detectMinorFailures(image: Buffer) {
  const facesResponse = await awsRekognitionClient.send(
    new DetectFacesCommand({
      Image: {
        Bytes: image,
      },
      Attributes: ['AGE_RANGE'],
    })
  )
  const faces = facesResponse.FaceDetails ?? []
  const faceFailures = faces
    .filter(
      face => face.AgeRange?.Low && face.AgeRange?.Low < MINOR_AGE_THRESHOLD
    )
    .map(face => ({
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
  const labelResponse = await awsRekognitionClient.send(
    new DetectLabelsCommand({
      Image: {
        Bytes: image,
      },
      Settings: {
        GeneralLabels: {
          LabelInclusionFilters: ['Teen', 'Girl', 'Boy', 'Child'],
        },
      },
    })
  )
  const labels = labelResponse.Labels ?? []
  const labelFailures = labels.map(label => ({
    reason: `Minor detected in image`,
    details: {
      label: label.Name,
      confidence: label.Confidence,
    },
  }))

  return labelFailures
}

async function extractTextFromImage(image: Buffer) {
  const extractedText = await awsRekognitionClient.send(
    new DetectTextCommand({
      Image: {
        Bytes: image,
      },
    })
  )
  const detections = extractedText.TextDetections ?? []
  const textSegments = detections
    .filter(({ Type }) => Type === 'LINE')
    .map(detection => detection.DetectedText ?? '')

  return textSegments
}

const detectToxicContent = async (textSegments: string[]) => {
  const toxicContent = []
  const concatenatedText = textSegments.join(' ')
  const result = await awsComprehendClient.send(
    new DetectToxicContentCommand({
      TextSegments: [{ Text: concatenatedText }],
      LanguageCode: 'en',
    })
  )
  if (result.ResultList) {
    toxicContent.push(
      ...result.ResultList.map(r => ({
        text: concatenatedText,
        result: r,
      }))
    )
  }

  const highToxicity = toxicContent
    .filter(({ result }) => result.Toxicity && result.Toxicity > 0.5)
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
}: {
  entityConfidence: number
  entityText: string
  sessionId: string
  isVolunteer: boolean
}) {
  // Since many users will be sharing numbers that look like phone numbers,
  // we want to moderate them in similar way we moderate phone numbers in messages.
  // PII is very permisive with what's a phone number, so let's run it throough our regex
  // and then through the false positive fallback
  const isMaybePhone = entityConfidence > 0.9 && PHONE_REGEX.test(entityText)

  if (!isMaybePhone) {
    return false
  }

  const aiModerationResult = await getAiModerationResult(
    {
      message: entityText,
      sessionId,
    },
    isVolunteer
  )

  return aiModerationResult?.isPhoneNumber ?? true
}

function isLikelyToBeAnAdderess({
  entityConfidence,
  entityText,
}: {
  entityConfidence: number
  entityText: string
}) {
  // The PII api flags any part of an address as an ADDRESS.
  // That means things like "Virginia" are flagged as an address.
  // This attempts to filter out these false positives by checking if the text contains a space
  // since actual addresses contain spaces
  // and that the confidence is high
  return entityConfidence > 0.9 && /\s/g.test(entityText)
}

function existsInArray(array: any[], item: any) {
  return array.some(i => i === item)
}

async function detectPii(
  text: string,
  sessionId: string,
  isVolunteer: boolean
) {
  const piiEntities = await awsComprehendClient.send(
    new DetectPiiEntitiesCommand({
      Text: text,
      LanguageCode: 'en',
    })
  )
  const entities = piiEntities.Entities ?? []

  const links: {
    reason: 'Link'
    details: { text: string; confidence: number }
  }[] = []
  const emails: {
    reason: 'Email'
    details: { text: string; confidence: number }
  }[] = []
  const phones: {
    reason: 'Phone'
    details: { text: string; confidence: number }
  }[] = []
  const addresses: {
    reason: 'Address'
    details: { text: string; confidence: number }
  }[] = []
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
    } else if (entity.Type === 'EMAIL' && !existsInArray(emails, entityText)) {
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
      isLikelyToBeAnAdderess({ entityConfidence, entityText }) &&
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

  return [...links, ...emails, ...phones, ...addresses]
}

async function detectTextModerationFailures(
  image: Buffer,
  sessionId: string,
  isVolunteer: boolean
) {
  const textSegments = await extractTextFromImage(image)

  if (textSegments.length === 0) {
    return []
  }

  const [toxicity, pii] = await Promise.all([
    detectToxicContent(textSegments),
    detectPii(textSegments.join(' '), sessionId, isVolunteer),
  ])

  return [...toxicity, ...pii]
}

async function handleVideoFrameModerationFailure({
  userId,
  sessionId,
  failureReasons,
  image,
}: {
  userId: string
  sessionId: string
  failureReasons: VideoFrameModerationFailureReason[]
  image: Buffer
}) {
  const moderatedScreenshareS3Key = `${sessionId}-${crypto
    .randomBytes(8)
    .toString('hex')}`
  const bucketName = config.awsS3.moderatedScreenshareBucket

  const { location } = await putObject(
    bucketName,
    moderatedScreenshareS3Key,
    image
  )

  logger.warn(
    { sessionId, reasons: failureReasons, imageUrl: location },
    'Screenshare triggered moderation'
  )

  await handleModerationInfraction(userId, sessionId, {
    failures: failureReasons.reduce((acc, reason) => {
      acc[reason.reason] = {
        ...reason.details,
        imageUrl: location,
      }
      return acc
    }, {} as Record<VideoFrameModerationFailureReason['reason'], VideoFrameModerationFailureReason['details']>),
  })
}

export const moderateVideoFrame = async (
  frame: Buffer,
  sessionId: string,
  userId: string,
  isVolunteer: boolean
): Promise<{
  failureReasons: VideoFrameModerationFailureReason[]
}> => {
  const [
    moderationFailureReasons,
    minorFailures,
    textModerationFailureReasons,
  ] = await Promise.all([
    detectImageModerationFailures(frame),
    detectMinorFailures(frame),
    detectTextModerationFailures(frame, sessionId, isVolunteer),
  ])

  const failureReasons = [
    ...moderationFailureReasons,
    ...minorFailures,
    ...textModerationFailureReasons,
  ]

  if (failureReasons.length > 0) {
    await handleVideoFrameModerationFailure({
      userId,
      sessionId,
      failureReasons,
      image: frame,
    })
  }

  return {
    failureReasons,
  }
}

export async function getIndividualSessionMessageModerationResponse({
  censoredSessionMessage,
  isVolunteer,
}: {
  censoredSessionMessage: Pick<
    CensoredSessionMessage,
    'sessionId' | 'message'
  > & { id?: string }
  isVolunteer: boolean
}) {
  const model = 'gpt-4o'
  const promptData = await getPromptData(
    LangfusePromptNameEnum.GET_SESSION_MESSAGE_MODERATION_DECISION,
    FALLBACK_MODERATION_PROMPT
  )
  const t = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_MESSAGE,
    sessionId: censoredSessionMessage.sessionId,
  })

  const gen = t.generation({
    name: LangfuseGenerationName.SESSION_MESSAGE_MODERATION_DECISION,
    model,
    input: { censoredSessionMessage, isVolunteer },
    // Attach prompt object, if it exists, in order to associate the generation with the prompt in LF
    ...(promptData.promptObject && { prompt: promptData.promptObject }),
  })
  try {
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: promptData.prompt,
        },
        {
          role: 'user',
          content: wrapMessageInXmlTags(
            censoredSessionMessage.message,
            isVolunteer
          ),
        },
      ],
      response_format: { type: 'json_object' },
    })

    gen.end({
      output: chatCompletion,
    })

    return JSON.parse(chatCompletion.choices[0].message.content || '')
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

function formatAiResponse(response: {
  message: string
  appropriate: boolean
  reasons: string[]
}) {
  return response.appropriate ? {} : response.reasons
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
      ;(testMatches as string[]).forEach(match => {
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
  isVolunteer: boolean
) => {
  return await timeLimit({
    promise: getIndividualSessionMessageModerationResponse({
      censoredSessionMessage,
      isVolunteer,
    }),
    fallbackReturnValue: null,
    timeLimitReachedErrorMessage:
      'AI Moderation time limit reached. Returning regex value',
    waitInMs: 3000,
  })
}

export type ModerationFailureReasons = {
  failures: Record<string, string[] | never>
}

export type oldClientModerationResult = boolean
export async function moderateMessage({
  message,
  senderId,
  isVolunteer,
  sessionId,
}: {
  message: string
  senderId: string
  isVolunteer: boolean
  sessionId?: string
}): Promise<oldClientModerationResult | ModerationFailureReasons> {
  const { isClean, failures, sanitizedMessage } = regexModerate(message)

  /*
   * Old high-line mid town clients will not send up sessionId
   * return `true` or `false` for them
   */
  if (!sessionId) {
    return isClean
  }

  let result = failures
  if (!isClean) {
    const censoredSessionMessage = await createCensoredMessage({
      senderId,
      message,
      sessionId,
      censoredBy: CENSORED_BY.regex,
    })

    const userTargetStatus = await getAiModerationFeatureFlag(senderId)
    if (userTargetStatus === AI_MODERATION_STATE.targeted) {
      const response = await getAiModerationResult(
        censoredSessionMessage,
        isVolunteer
      )
      // Override the regex moderation decision with the AI one if it's available
      result.failures =
        response === null ? result.failures : formatAiResponse(response)
    } else if (userTargetStatus === AI_MODERATION_STATE.notTargeted) {
      await createIndividualSessionMessageModerationJob({
        censoredSessionMessage,
        isVolunteer,
      })
    }

    logger.info(
      { censoredSessionMessage, reasons: result },
      'Session message was censored'
    )
  }

  return result
}

const handleModerationInfraction = async (
  userId: string,
  sessionId: string,
  reasons:
    | ModerationFailureReasons
    | Record<
        VideoFrameModerationFailureReason['reason'],
        VideoFrameModerationFailureReason['details']
      >
) => {
  const strikesForUserInSession = await ModerationInfractionsRepo.insertModerationInfraction(
    {
      userId,
      sessionId,
      reason: reasons.failures,
    }
  )
  if (strikesForUserInSession >= config.maxModerationInfractionsPerSession) {
    await UsersRepo.banUserById(
      userId,
      USER_BAN_TYPES.LIVE_MEDIA,
      USER_BAN_REASONS.AUTOMATED_MODERATION
    )
    const socketService = await SocketService.getInstance()
    await socketService.emitUserLiveMediaBannedEvents(userId, sessionId)
  }
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
}: {
  transcript: string
  sessionId: string
  userId: string
  saidAt: Date
}): Promise<
  CleanTranscriptModerationResult | SanitizedTranscriptModerationResult
> => {
  const { isClean, failures, sanitizedMessage } = regexModerate(transcript)
  if (isClean) return { isClean: true } as CleanTranscriptModerationResult
  // @TODO - run through AI moderation

  // If the message is unclean, track it as an infraction against the user
  await handleModerationInfraction(userId, sessionId, failures)
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

enum AnalyzeImageErrorCodeEnum {
  INVALID_REQUEST_BODY = 'InvalidRequestBody',
}
export const moderateImage = async (
  imageFile: Express.Multer.File,
  sessionId: string
): Promise<{
  isClean: boolean
  failureReasons?: ModerationFailureReasons
}> => {
  const reqBody = {
    timeout: 3 * 1000,
    body: {
      image: {
        content: imageFile.buffer.toString('base64'),
      },
    },
  }
  const result = await azureContentSafetyClient
    .path('/image:analyze')
    .post(reqBody)

  if (result.status !== '200') {
    const errResponse = result as AnalyzeImageDefaultResponse
    const logData = {
      error: errResponse.body.error,
    }
    const logMsg = 'Failed to get image analysis from Azure Content Safety'
    if (
      errResponse.body.error.code ===
      AnalyzeImageErrorCodeEnum.INVALID_REQUEST_BODY
    ) {
      logger.warn(logData, logMsg)
      throw new InputError('Image is invalid')
    }
    logger.error(logData, logMsg)
    throw new Error('Could not moderate image')
  }

  logger.info(
    {
      fileName: imageFile.originalname,
      sessionId,
      analysis: (result as AnalyzeImage200Response).body.categoriesAnalysis,
    },
    'Image moderation result'
  )

  return getImageModerationDecision(result as AnalyzeImage200Response)
}

const getImageModerationDecision = (
  result: AnalyzeImage200Response
): {
  isClean: boolean
  failureReasons?: ModerationFailureReasons
} => {
  const failureCategories = result.body.categoriesAnalysis.filter(
    category =>
      category.severity ?? 0 > AZURE_IMAGE_ANALYSIS_CATEGORY_SEVERITY_THRESHOLD
  )
  const isClean = failureCategories.length === 0
  return {
    isClean,
    ...(isClean ? {} : failureCategories),
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
  const result = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: chunkAsString,
      },
    ],
    response_format: { type: 'json_object' },
  })
  gen.end({
    output: result,
  })
  return JSON.parse(result.choices[0].message.content || '')
}

export type TranscriptChunkModerationResult = {
  confidence: number // higher = more likely to be inappropriate
  explanation: string
}
export const moderateTranscript = async (
  transcript: SessionTranscript
): Promise<TranscriptChunkModerationResult[]> => {
  const getChunkAsString = (chunk: SessionTranscriptItem[]): string => {
    return chunk.reduce((acc: string, item) => {
      return (
        acc + `<message><role>${item.role}</role>${item.message}</message>\n`
      )
    }, '')
  }

  const promptData = await getPromptData(
    LangfusePromptNameEnum.SESSION_TRANSCRIPT_MODERATION,
    FALLBACK_TRANSCRIPT_MODERATION_PROMPT
  )

  const t = LangfuseService.getClient().trace({
    name: LangfuseTraceName.MODERATE_SESSION_TRANSCRIPT,
    sessionId: transcript.sessionId,
    metadata: {
      sessionId: transcript.sessionId,
    },
  })

  const model = 'gpt-4o'
  const results: TranscriptChunkModerationResult[] = []
  const chunks: SessionTranscriptItem[][] = chunk(transcript.messages, 50)
  for (const chunk of chunks) {
    const result = await getSessionTranscriptModerationResult(
      promptData.prompt,
      getChunkAsString(chunk),
      model,
      t,
      promptData?.promptObject
    )
    results.push(result)
  }

  return results
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
You are a Trust & Safety expert. Your job is to review a tutoring conversation between a student and volunteer tutor and decide if it violates any policies.
You will find the chat message in <message> tags and the role of the user who sent the message in the <role> tags. Policies are described in the <policy> tags.
Given a chunk of the conversation, provide a confidence rating from 0 to 100 to quantify your confidence that the conversation is inappropriate, where 100 means maximally confident that the conversation is inappropriate.
<policy>No hate speech</policy>
<policy>No sexual or flirtatious content</policy>
<policy>No circumventing the platform by communicating outside of it OR expressing intent to. This includes sharing contact information such as email addresses, usernames for other apps, phone numbers, etc.</policy>
<policy>No sharing personally identifiable information such as one's school, place of employment, address, contact information, etc.</policy>
<policy>The nature of the conversation must be appropriate in a tutoring context</policy>
Provide your response in this JSON format: "{ confidence: number, explanation: string }"
`
