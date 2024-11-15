export type SessionMedium = 'audio' | 'video'

export type UserCensorship = {
  userId: string
  sessionId: string
  reason: string
  medium: SessionMedium
  createdAt: Date
  updatedAt: Date
  active: boolean
  comment?: string | null
}
