import { client } from '../clients/product-client'
import { Ulid } from '../models/pgUtils'
import { GRADES } from '../constants'
import type { UserRole } from '../types/users'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { getUPFByUserId } from '../models/UserProductFlags'
import logger from '../logger'
import { getNthsUserAttributes } from './NTHSUserAttributesService'

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
  createdAt: Date
  totalSessions: number
  banType?: string
  isTestUser: boolean
  hasStudentRole: boolean
  hasVolunteerRole: boolean
  hasTeacherRole: boolean
  isNthsMember: boolean
  isNthsAdmin: boolean
  isNthsPresident: boolean
  onboarded?: boolean
  approved?: boolean
  sessionsAsTutor?: number
  partner?: string | null
  schoolPartner?: string | null
  partnerSchoolId?: Ulid | null
  partnerSchoolName?: string | null
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
  userId?: Ulid
): Promise<Partial<AnalyticPersonProperties>> {
  let personProperties: Partial<AnalyticPersonProperties> = {}
  if (!userId) return personProperties

  try {
    const user = await getLegacyUserObject(userId)
    if (!user) return personProperties

    const [productFlags, nthsUserAttributes] = await Promise.all([
      getUPFByUserId(userId),
      getNthsUserAttributes(userId),
    ])

    personProperties = {
      ucId: user.id,
      userType: user.roleContext.activeRole,
      createdAt: user.createdAt,
      totalSessions: user.pastSessions.length,
      banType: user.banType,
      isTestUser: user.isTestUser,
      hasStudentRole: user.roleContext.hasRole('student'),
      hasVolunteerRole: user.roleContext.hasRole('volunteer'),
      hasTeacherRole: user.roleContext.hasRole('teacher'),
      ...nthsUserAttributes,
      signupSource: user.signupSource,
      occupation: user.occupation,
      usesClever: user.usesClever ?? false,
      certificationStats: {},
    }

    personProperties.partner =
      user.studentPartnerOrg ?? user.volunteerPartnerOrg
    if (!personProperties.partner) delete personProperties.partner

    if (user.isSchoolPartner) {
      // schoolPartner duplicates partnerSchoolName and stays only because existing PostHog
      // flags, cohorts or insights may filter on it. Remove it once they've moved over.
      personProperties.schoolPartner = user.schoolName ?? null
      personProperties.partnerSchoolId = user.schoolId ?? null
      personProperties.partnerSchoolName = user.schoolName ?? null
    }

    if (user.roleContext.hasRole('volunteer')) {
      personProperties.onboarded = user.isOnboarded
      personProperties.approved = user.isApproved
      personProperties.sessionsAsTutor = user.sessionsAsTutor
      personProperties.partner = user.volunteerPartnerOrg ?? null

      const certificationInfo = Object.entries(
        user.certifications ?? {}
      ).reduce<AnalyticCertificationStats>((acc, [subject, quizInfo]) => {
        acc[subject] = quizInfo.passed
        return acc
      }, {})
      personProperties = {
        ...personProperties,
        certificationStats: certificationInfo,
      }
      const hasSubjectCertification = Object.entries(certificationInfo).some(
        ([cert, info]) => cert !== 'upchieve101' && info
      )
      personProperties.hasSubjectCertification = hasSubjectCertification
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
  } catch (error) {
    logger.error('Failed to get person properties for analytics user', {
      err: error,
      userId: userId ?? 'Anonymous',
    })
  }
  return personProperties
}
