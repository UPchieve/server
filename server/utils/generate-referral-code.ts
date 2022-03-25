import { Ulid } from '../models/pgUtils'

function generateReferralCode(userId: Ulid) {
  return base64url(Buffer.from(userId, 'hex'))
}

export default generateReferralCode
