export type InsertModerationInfractionArgs = {
  userId: string
  sessionId: string
  reason: string
}

export type UpdateModerationInfractionArgs = {
  active?: boolean
}

export type ModerationInfraction = {
  id: string
  userId: string
  sessionId: string
  reason: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
