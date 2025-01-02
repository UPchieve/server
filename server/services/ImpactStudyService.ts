import { Ulid } from '../models/pgUtils'
import { getUPFByUserId } from '../models/UserProductFlags'

export async function isUserInImpactStudy(userId: Ulid) {
  const flags = await getUPFByUserId(userId)
  return !!flags?.impactStudyEnrollmentAt
}
