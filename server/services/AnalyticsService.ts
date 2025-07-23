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
  hasSubjectCertification?: boolean
  signupSource?: string
  occupation?: string
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
      userType: user.roleContext.activeRole,
      createdAt: user.createdAt.toISOString(),
      totalSessions: user.pastSessions.length,
      banType: user.banType,
      isTestUser: user.isTestUser,
      hasStudentRole: user.roleContext.hasRole('student'),
      hasVolunteerRole: user.roleContext.hasRole('volunteer'),
      hasTeacherRole: user.roleContext.hasRole('teacher'),
      signupSource: user.signupSource,
      occupation: user.occupation,
      usesClever: user.usesClever ?? false,
    } as AnalyticPersonProperties

    personProperties.partner =
      user.studentPartnerOrg ?? user.volunteerPartnerOrg
    if (!personProperties.partner) delete personProperties.partner

    if (user.isSchoolPartner) {
      personProperties.schoolPartner = user.schoolName ?? null
    }

    if (user.roleContext.hasRole('volunteer')) {
      personProperties.onboarded = user.isOnboarded
      personProperties.approved = user.isApproved
      personProperties.partner = user.volunteerPartnerOrg ?? null

      const certificationInfo = Object.entries(
        user.certifications ?? {}
      ).reduce<AnalyticCertificationStats>((acc, [subject, quizInfo]) => {
        acc[subject] = quizInfo.passed
        return acc
      }, {})
      personProperties = {
        ...personProperties,
        ...certificationInfo,
      }
      const hasSubjectCertification = Object.entries(certificationInfo).some(
        ([cert, info]) => cert !== 'upchieve101' && info
      )
      personProperties.hasSubjectCertification = hasSubjectCertification
    }

    if (user.roleContext.hasRole('student')) {
      personProperties.gradeLevel = user.gradeLevel ?? null
      personProperties.fallIncentiveEnrollmentAt =
        productFlags?.fallIncentiveEnrollmentAt?.toISOString() ?? null
      personProperties.usesClever = user.usesClever
      personProperties.usesGoogle = user.usesGoogle
    }

    if (user.roleContext.hasRole('teacher')) {
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
