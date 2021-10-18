import { Types } from 'mongoose'

const getSessionRoom = (sessionId: string | Types.ObjectId): string => `sessions-${sessionId}`

module.exports = getSessionRoom
export default getSessionRoom
