import { getUserContactInfoById, UserContactInfo } from '../models/User'
import { getUPFByUserId, UserProductFlags } from '../models/UserProductFlags'
import { getFallIncentiveProgramPayload } from '../services/FeatureFlagService'
import moment, { Moment } from 'moment'

type UserAndFallIncentiveStartDate = {
  user: UserContactInfo
  productFlags: UserProductFlags
  fallIncentiveProgramStartDate: Moment
}

export async function getUserAndFallIncentiveStartDate(
  userId: string,
  enrollmentFlag: boolean
): Promise<UserAndFallIncentiveStartDate | undefined> {
  const user = await getUserContactInfoById(userId)
  const productFlags = await getUPFByUserId(userId)
  const incentiveProgramDate = await getFallIncentiveProgramPayload(userId)

  if (
    !user ||
    !incentiveProgramDate ||
    !productFlags ||
    enrollmentFlag !== !!productFlags?.fallIncentiveEnrollmentAt
  )
    return

  const fallIncentiveProgramStartDate = moment(incentiveProgramDate)
  return { user, productFlags, fallIncentiveProgramStartDate }
}
