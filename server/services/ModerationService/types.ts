export enum LangfuseTraceName {
  MODERATE_SESSION_MESSAGE = 'moderateSessionMessage',
  MODERATE_SESSION_TRANSCRIPT = 'moderateSessionTranscript',
  MODERATE_IMAGE = 'MODERATE_IMAGE',
  MODERATE_WHITEBOARD_TEXT_NODE = 'moderateWhiteboardTextNode',
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
  IS_IMAGE_EDUCATIONAL = 'isImageEducational',
}

export type ModerationSource =
  | 'image_upload'
  | 'screenshare'
  | 'audio_transcription'
  | 'text_chat'
  | 'whiteboard'
  | 'whiteboard-text-node'

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
  failures: ModerationFailureReasons
  sanitizedMessage: string
}

export type ModerationAIResult = {
  message: string
  appropriate: boolean
  reasons: Record<string, string[] | never>
}

export type ModerationFailureReasons = {
  failures: Record<string, string[] | never>
}

export type ModerationSessionReviewFlagReason =
  | 'PII'
  | 'HATE_SPEECH'
  | 'PLATFORM_CIRCUMVENTION'
  | 'INAPPROPRIATE_CONTENT'
  | 'SAFETY'
  | 'N/A'

export type ImageModerationFailureReason = {
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
