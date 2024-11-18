import { UserContactInfo } from '../models/User'
import { Socket } from 'socket.io'
import { Ulid } from '../models/pgUtils'
import { CurrentSession, UnfulfilledSessions } from '../models/Session'
import Delta from 'quill-delta'

export type SocketDelta = Delta & {
  id?: string
}

export type ClientToServerEvents = {
  join: (data: { sessionId: Ulid; joinedFrom: string }) => void
  'activity-prompt-sent': (data: { sessionId: Ulid }) => void
  'auto-end-session': (data: { sessionId: Ulid }) => void
  'sessions/recap:join': (data: { sessionId: Ulid }) => void
  list: (_data: { sessionId: Ulid }, callback: Function) => void
  typing: (data: { sessionId: Ulid }) => void
  notTyping: (data: { sessionId: Ulid }) => void
  message: (data: {
    user: SocketUser
    sessionId: Ulid
    message: string
    source: 'recap' | ''
    type?: 'voice'
    transcript?: string
  }) => void
  requestQuillState: (data: { sessionId: Ulid }) => void
  requestQuillStateV2: (data: { sessionId: Ulid }) => void
  transmitQuillDeltaV2: (data: { sessionId: Ulid; update: string }) => void
  transmitQuillDelta: (data: { sessionId: Ulid; delta: SocketDelta }) => void
  transmitQuillSelection: (data: {
    sessionId: Ulid
    range: { index: number; length: number }
  }) => void
  resetWhiteboard: (data: { sessionId: Ulid }) => void
  'sessions:leave': (data: { sessionId: Ulid }) => void
  'sessions/recap:leave': (data: { sessionId: Ulid }) => void
  'sessions:joined-call': (data: { sessionId: string }) => void
  'sessions:left-call': (data: { sessionId: string }) => void
}

export type ServerToClientEvents = {
  redirect: (error?: Error) => void
  message: (data: { sessionId: Ulid; message: string }) => void
  'sessions/partner:in-session': (status: boolean) => void
  'sessions/recap:joined': () => void
  'sessions/recap:join-failed': (error: Error) => void
  sessions: (sessions: UnfulfilledSessions[]) => void
  'is-typing': (data: { sessionId: Ulid }) => void
  'not-typing': (data: { sessionId: Ulid }) => void
  messageError: (data: { sessionId: Ulid }) => void
  lastDeltaStored: (data: { delta: Delta }) => void
  quillState: (data: { delta: Delta | undefined }) => void
  retryLoadingDoc: () => void
  quillStateV2: (data: { updates: string[] }) => void
  partnerQuillDeltaV2: (data: { update: string }) => void
  partnerQuillDelta: (data: { delta: SocketDelta }) => void
  quillPartnerSelection: (data: {
    range: { index: number; length: number }
  }) => void
  resetWhiteboard: () => void
  'session-change': (data: CurrentSession | undefined) => void
  'sessions:partner-joined-call': () => void
  'sessions:partner-left-call': () => void
}

export type InterServerEvents = {}

// Define types for `data` on `socket.data`
export type SocketData = {
  sessionId?: Ulid
  downgraded?: boolean
}

export type SocketUser = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> & {
  request: { user?: UserContactInfo }
}
