import { Ulid } from '../models/pgUtils'
import base64url from 'base64url'

function generateReferralCode(userId: Ulid) {
  return base64url(Buffer.from(userId, 'hex'))
}

export default generateReferralCode
