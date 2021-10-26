import { Types } from 'mongoose'

const getSessionRoom = (sessionId: string | Types.ObjectId): string =>
  `sessions-${sessionId}`

export default getSessionRoom
