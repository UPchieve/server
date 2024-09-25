import { client } from '../product-client'
import { Ulid } from '../models/pgUtils'
import { GRADES } from '../constants'
import { UserRole } from '../models/User'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { getUPFByUserId } from '../models/UserProductFlags'
import { ISODateString } from '../types/dates'
import {
  isStudentUserType,
  isTeacherUserType,
  isVolunteerUserType,
} from './UserRolesService'

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
  onboarded?: boolean
  approved?: boolean
  partner?: string | null
  schoolPartner?: string | null
  gradeLevel?: GRADES | null
  fallIncentiveEnrollmentAt?: ISODateString | null
} & AnalyticCertificationStats

export async function getPersonPropertiesForAnalytics(userId: Ulid) {
  const user = await getLegacyUserObject(userId)
  if (!user) return {} as AnalyticPersonProperties

  const productFlags = await getUPFByUserId(userId)

  const userProps = {
    ucId: user.id,
    userType: user.userType,
    createdAt: user.createdAt.toISOString(),
    totalSessions: user.pastSessions.length,
    banType: user.banType,
    isTestUser: user.isTestUser,
  } as AnalyticPersonProperties
  if (isVolunteerUserType(user.userType)) {
    userProps.onboarded = user.isOnboarded
    userProps.approved = user.isApproved
    userProps.partner = user.volunteerPartnerOrg ?? null

    const certificationInfo = Object.entries(user.certifications ?? {}).reduce<
      AnalyticCertificationStats
    >((acc, [subject, quizInfo]) => {
      acc[subject] = quizInfo.passed
      return acc
    }, {})
    return {
      ...userProps,
      ...certificationInfo,
    }
  } else if (isStudentUserType(user.userType)) {
    userProps.partner = user.studentPartnerOrg ?? null
    userProps.gradeLevel = user.gradeLevel ?? null
    if (user.isSchoolPartner) userProps.schoolPartner = user.schoolName ?? null
    userProps.fallIncentiveEnrollmentAt =
      productFlags?.fallIncentiveEnrollmentAt?.toISOString() ?? null
  } else if (isTeacherUserType(user.userType)) {
    // TODO: TEACHER PROFILES.
  }

  return userProps
}
