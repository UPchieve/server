export type SessionAudioTranscriptMessage = {
  id: string
  userId: string
  sessionId: string
  message: string
  saidAt: Date
}

export type InsertSessionAudioTranscriptMessageArgs = Pick<
  SessionAudioTranscriptMessage,
  'userId' | 'sessionId' | 'message' | 'saidAt'
>
