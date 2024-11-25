export type InfractionReasons = { [key: string]: string[] }

export type InsertModerationInfractionArgs = {
  userId: string
  sessionId: string
  reason: InfractionReasons
}

export type UpdateModerationInfractionArgs = {
  active?: boolean
}

export type ModerationInfraction = {
  id: string
  userId: string
  sessionId: string
  reason: InfractionReasons
  active: boolean
  createdAt: Date
  updatedAt: Date
}
