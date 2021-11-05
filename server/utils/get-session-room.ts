import { Types } from 'mongoose'

const getSessionRoom = (sessionId: Types.ObjectId): string =>
  `sessions-${sessionId}`

export default getSessionRoom
