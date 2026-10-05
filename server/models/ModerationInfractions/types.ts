export type PhotoDnaMatchFlag = {
  Source: string
  Violations: string[]
  MatchDistance: number
  AdvancedInfo: Array<{ Key: string; Value: string }>
}

export type PhotoDnaInfractionReason = {
  contentId: string | null
  trackingId: string
  matchFlags: PhotoDnaMatchFlag[]
}

// String arrays also cover PhotoDNA records saved before structured details.
export type InfractionReasons =
  | { [key: string]: string[] }
  | { photoDna: PhotoDnaInfractionReason }

export type InsertModerationInfractionArgs = {
  userId: string
  sessionId?: string
  reason: InfractionReasons
}

export type UpdateModerationInfractionArgs = {
  active?: boolean
}

export type ModerationInfraction = {
  id: string
  userId: string
  sessionId?: string
  reason: InfractionReasons
  active: boolean
  quarantinedOn?: Date
  createdAt: Date
  updatedAt: Date
}
