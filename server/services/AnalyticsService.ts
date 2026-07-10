import { client } from '../clients/product-client'
import { Ulid } from '../models/pgUtils'
import { GRADES } from '../constants'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { getUPFByUserId } from '../models/UserProductFlags'
import logger from '../logger'
import type { UserRole } from '../types/users'
import type { Uuid } from '../types/shared'

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
  ucId: Uuid
  userType: UserRole
  createdAt: Date
  totalSessions: number
  banType?: string
  isTestUser: boolean
  hasStudentRole: boolean
  hasVolunteerRole: boolean
  hasTeacherRole: boolean
  onboarded?: boolean
  approved?: boolean
  partner?: string | null
  schoolPartner?: string | null
  gradeLevel?: GRADES | null
  fallIncentiveEnrollmentAt?: Date | null
  usesClever?: boolean
  usesGoogle?: boolean
  hasSubjectCertification?: boolean
  signupSource?: string
  occupation?: string[]
  certificationStats: AnalyticCertificationStats
}

export async function getPersonPropertiesForAnalytics(
  userId?: Uuid
): Promise<AnalyticPersonProperties | null> {
  if (!userId) return null

  try {
    const user = await getLegacyUserObject(userId)
    if (!user) return null

    const productFlags = await getUPFByUserId(userId)

    const certificationStats: AnalyticCertificationStats = {}
    const personProperties: AnalyticPersonProperties = {
      ucId: user.id,
      userType: user.roleContext.activeRole,
      createdAt: user.createdAt,
      totalSessions: user.pastSessions.length,
      banType: user.banType,
      isTestUser: user.isTestUser,
      hasStudentRole: user.roleContext.hasRole('student'),
      hasVolunteerRole: user.roleContext.hasRole('volunteer'),
      hasTeacherRole: user.roleContext.hasRole('teacher'),
      signupSource: user.signupSource,
      occupation: user.occupation,
      usesClever: user.usesClever ?? false,
      certificationStats,
    }

    const partner = user.studentPartnerOrg ?? user.volunteerPartnerOrg
    if (partner) {
      personProperties.partner = partner
    }

    if (user.isSchoolPartner) {
      personProperties.schoolPartner = user.schoolName ?? null
    }

    if (user.roleContext.hasRole('volunteer')) {
      personProperties.onboarded = user.isOnboarded
      personProperties.approved = user.isApproved
      personProperties.partner = user.volunteerPartnerOrg ?? null

      for (const [subject, quizInfo] of Object.entries(
        user.certifications ?? {}
      )) {
        certificationStats[subject] = quizInfo.passed
      }

      personProperties.hasSubjectCertification = Object.entries(
        certificationStats
      ).some(([cert, passed]) => cert !== 'upchieve101' && passed)
    }

    if (user.roleContext.hasRole('student')) {
      personProperties.gradeLevel = user.gradeLevel ?? null
      personProperties.fallIncentiveEnrollmentAt =
        productFlags?.fallIncentiveEnrollmentAt ?? null
      personProperties.usesClever = user.usesClever
      personProperties.usesGoogle = user.usesGoogle
    }

    if (user.roleContext.hasRole('teacher')) {
      // TODO: TEACHER PROFILES.
    }

    return personProperties
  } catch (error) {
    logger.error(
      `Failed to get person properties for analytics user ${
        userId ?? 'Anonymous'
      } - error ${error}`
    )
  }
  return null
}
