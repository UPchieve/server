import { client } from '../product-client'
import { Ulid } from '../models/pgUtils'
import { GRADES } from '../constants'
import { UserRole } from '../models/User'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { getUPFByUserId } from '../models/UserProductFlags'
import { ISODateString } from '../types/dates'
import logger from '../logger'

export const captureEvent = (
  userId: Ulid,
  eventName: string,
  eventProperties?: { [key: string]: any },
  userProperties?: { [key: string]: string | number | boolean }
): void => {
  const properties = {
    ...eventProperties,
    $set: userProperties,
  }
  client.capture({
    distinctId: userId.toString(),
    event: eventName,
    properties,
  })
}

export type IdentifyProperties = {
  schoolPartner?: string
  partner?: string
  userType?: string
  fallIncentiveEnrollmentAt?: Date
}

export function identify(userId: Ulid, properties: IdentifyProperties) {
  client.identify({
    distinctId: userId.toString(),
    properties,
  })
}

export type AnalyticCertificationStats = {
  [subject: string]: boolean
}

export type AnalyticPersonProperties = {
  ucId: Ulid
  userType: UserRole
  createdAt: ISODateString
  totalSessions: number
  banType: string
  isTestUser: boolean
  hasStudentRole: boolean
  hasVolunteerRole: boolean
  hasTeacherRole: boolean
  onboarded?: boolean
  approved?: boolean
  partner?: string | null
  schoolPartner?: string | null
  gradeLevel?: GRADES | null
  fallIncentiveEnrollmentAt?: ISODateString | null
  usesClever?: boolean
  usesGoogle?: boolean
} & AnalyticCertificationStats

export async function getPersonPropertiesForAnalytics(userId?: Ulid) {
  let personProperties = {} as AnalyticPersonProperties
  if (!userId) return personProperties

  try {
    const user = await getLegacyUserObject(userId)
    if (!user) return personProperties

    const productFlags = await getUPFByUserId(userId)

    personProperties = {
      ucId: user.id,
      userType: user.userType,
      createdAt: user.createdAt.toISOString(),
      totalSessions: user.pastSessions.length,
      banType: user.banType,
      isTestUser: user.isTestUser,
      hasStudentRole: user.roleContext.hasRole('student'),
      hasVolunteerRole: user.roleContext.hasRole('volunteer'),
      hasTeacherRole: user.roleContext.hasRole('teacher'),
    } as AnalyticPersonProperties

    if (user.roleContext.isActiveRole('volunteer')) {
      personProperties.onboarded = user.isOnboarded
      personProperties.approved = user.isApproved
      personProperties.partner = user.volunteerPartnerOrg ?? null

      const certificationInfo = Object.entries(
        user.certifications ?? {}
      ).reduce<AnalyticCertificationStats>((acc, [subject, quizInfo]) => {
        acc[subject] = quizInfo.passed
        return acc
      }, {})
      return {
        ...personProperties,
        ...certificationInfo,
      }
    } else if (user.roleContext.isActiveRole('student')) {
      personProperties.partner = user.studentPartnerOrg ?? null
      personProperties.gradeLevel = user.gradeLevel ?? null
      if (user.isSchoolPartner)
        personProperties.schoolPartner = user.schoolName ?? null
      personProperties.fallIncentiveEnrollmentAt =
        productFlags?.fallIncentiveEnrollmentAt?.toISOString() ?? null
      personProperties.usesClever = user.usesClever
      personProperties.usesGoogle = user.usesGoogle
    } else if (user.roleContext.isActiveRole('teacher')) {
      // TODO: TEACHER PROFILES.
    }
  } catch (error) {
    logger.error(
      `Failed to get person properties for analytics user ${
        userId ?? 'Anonymous'
      } - error ${error}`
    )
  }

  return personProperties
}
