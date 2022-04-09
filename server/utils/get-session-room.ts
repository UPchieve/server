import { Ulid } from '../models/pgUtils'

const getSessionRoom = (sessionId: Ulid): string => `sessions-${sessionId}`

export default getSessionRoom
