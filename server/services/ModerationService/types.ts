// TODO: Start moving Langfuse specific to the Langfuse client
// as typing is enforced.
export enum LangfuseTraceName {
  MODERATE_SESSION_MESSAGE = 'moderateSessionMessage',
  MODERATE_SESSION_TRANSCRIPT = 'moderateSessionTranscript',
  MODERATE_IMAGE = 'MODERATE_IMAGE',
  MODERATE_WHITEBOARD_TEXT_NODE = 'moderateWhiteboardTextNode',
  MODERATE_ASSIGNMENT_INFO = 'moderateAssignmentInfo',
}
export enum LangfuseGenerationName {
  SESSION_MESSAGE_MODERATION_DECISION = 'getModerationDecision',
  SESSION_TRANSCRIPT_MODERATION_DECISION = 'getSessionTranscriptModerationDecision',
  GET_ADDRESS_DETECTION_MODERATION_DECISION = 'getAddressDetectionModerationDecision',
  GET_QUESTIONABLE_LINK_MODERATION_DECISION = 'getQuestionableLinkModerationDecision',
  MODERATE_ASSIGNMENT_INFO = 'moderateAssignmentInfo',
}
export enum LangfuseTraceTagEnum {
  FLAGGED_BY_MODERATION = 'flagged-by-moderation',
}

export type ModerationSource =
  | 'image_upload'
  | 'screenshare'
  | 'assignment_image'
  | 'audio_transcription'
  | 'text_chat'
  | 'whiteboard'
  | 'whiteboard-text-node'
export type ImageModerationSource = Extract<
  ModerationSource,
  'image_upload' | 'screenshare' | 'assignment_image' | 'whiteboard'
>
export type LiveMediaSource = Extract<
  ModerationSource,
  'screenshare' | 'audio_transcription'
>

type WithImageModerationSource<S extends ImageModerationSource> = { source: S }

export type TeacherAssignmentContext =
  WithImageModerationSource<'assignment_image'> & {
    assignmentId: string
    userId: string
  }

export type SessionContext = WithImageModerationSource<'image_upload'> & {
  sessionId: string
  userId: string
  isVolunteer?: boolean
}

export type PostSessionContext = WithImageModerationSource<'whiteboard'> & {
  sessionId: string
}

export type ImageModerationContext =
  | TeacherAssignmentContext
  | SessionContext
  | PostSessionContext

export const IMAGE_MODERATION_CATEGORIES = [
  'ADDRESS',
  'Alcohol',
  'Drugs & Tobacco',
  'EMAIL',
  'Explicit',
  'Gambling',
  'GRAPHIC',
  'HARASSMENT_OR_ABUSE',
  'HATE_SPEECH',
  'Hate Symbols',
  'INSULT',
  'LINK',
  'Non-Explicit Nudity of Intimate parts and Kissing',
  'Person detected in image',
  'PHONE',
  'PROFANITY',
  'Rude Gestures',
  'SEXUAL',
  'Swimwear or Underwear',
  'Violence',
  'VIOLENCE_OR_THREAT',
  'Visually Disturbing',
] as const
export type ModerationCategory = (typeof IMAGE_MODERATION_CATEGORIES)[number]
export type ImageModerationInfraction = {
  category: ModerationCategory
  confidence: number
  text?: string
}

export type ModeratedLink = {
  reason: LiveMediaModerationCategories.LINK
  details: {
    text: string
    confidence: number
    policyNames?: string[]
    explanation?: string
  }
}

export type ModeratedAddress = {
  reason: LiveMediaModerationCategories.ADDRESS
  details: { text: string; confidence: number; explanation?: string }
}

export type ModeratedEmail = {
  reason: LiveMediaModerationCategories.EMAIL
  details: { text: string; confidence: number }
}

export type ModeratedPhone = {
  reason: LiveMediaModerationCategories.PHONE
  details: { text: string; confidence: number }
}

export type ModeratedPII =
  | ModeratedLink
  | ModeratedEmail
  | ModeratedPhone
  | ModeratedAddress

export type AddressDetectionModelResponse = {
  confidence: number
  explanation: string
}

export type ModeratedLinkResponse = {
  reason: LiveMediaModerationCategories.LINK
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

export type RegexModerationResult = {
  isClean: boolean
  failures: ModerationInfractionReasons
  sanitizedMessage: string
}

export type ModerationAIResult = {
  message: string
  appropriate: boolean
  reasons: Record<string, string[] | never>
}

export type ModerationInfractionReasons = {
  failures: Record<string, string[] | never>
}

export type ModerationInfractionCategories = string[]

export type ModerationSessionReviewFlagReason =
  | 'PII'
  | 'HATE_SPEECH'
  | 'PLATFORM_CIRCUMVENTION'
  | 'INAPPROPRIATE_CONTENT'
  | 'SAFETY'
  | 'N/A'

export type ImageModerationInfractionReason = {
  reason: string
  /*
    Moderation labels from AWS Rekognition,
      - Weapons, Nudity, Violence, Drug use, etc...
  */
  details?: any
}

export enum LiveMediaModerationCategories {
  PROFANITY = 'PROFANITY',
  VIOLENCE = 'Violence',
  LINK = 'LINK',
  ADDRESS = 'ADDRESS',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SWIM_WEAR = 'Swimwear or Underwear',
  EXPLICIT = 'Explicit',
  NON_EXPLICIT = 'Non-Explicit Nudity of Intimate parts and Kissing',
  DISTURBING = 'Visually Disturbing',
  DRUGS = 'Drugs & Tobacco',
  ALCOHOL = 'Alcohol',
  RUDE_GESTURES = 'Rude Gestures',
  GAMBLING = 'Gambling',
  HATE_SYMBOLS = 'Hate Symbols',
  PERSON_IN_IMAGE = 'Person detected in image',
  UNKNOWN = 'Unknown',
}
