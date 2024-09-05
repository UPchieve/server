import { getUserContactInfoById, UserContactInfo } from '../models/User'
import { getUPFByUserId, UserProductFlags } from '../models/UserProductFlags'
import { getFallIncentiveProgramPayload } from '../services/FeatureFlagService'

type UserAndFallIncentiveStartDate = {
  user: UserContactInfo
  productFlags: UserProductFlags
  incentiveProgramDate: Date
}

export async function getUserFallIncentiveData(
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

  return {
    user,
    productFlags,
    incentiveProgramDate: new Date(incentiveProgramDate),
  }
}
