import type {
  CertificationsPublic,
  LegacyUserPublic,
  PostsessionSurveyRatingsMetricPublic,
  QuizInfoPublic,
  ReferencePublic,
  RoleContextPublic,
  SponsorshipPublic,
  UserSessionStatsPublic,
} from '../contracts/users'
import type { UserSessionStats } from '../models/Session'
import type { LegacyUserModel } from '../models/User/legacy-user'
import {
  QuizInfo,
  Certifications,
  Reference,
  Sponsorship,
} from '../models/Volunteer'
import type { PostsessionSurveyRatingsMetric } from '../services/SurveyService'
import type { RoleContext } from '../services/UserRolesService'
import { toStudentAssignmentPublic } from './assignments'
import { toTrainingCoursesPublic } from './training'

function toRoleContextPublic(role: RoleContext): RoleContextPublic {
  return {
    activeRole: role.activeRole,
    legacyRole: role.legacyRole,
    roles: role.roles,
  }
}

function toUserSessionStatsPublic(
  stats: UserSessionStats
): UserSessionStatsPublic {
  return Object.fromEntries(
    Object.entries(stats).map(([subjectName, subjectStats]) => [
      subjectName,
      {
        totalRequested: subjectStats.totalRequested,
        totalHelped: subjectStats.totalHelped,
        topicName: subjectStats.topicName,
      },
    ])
  )
}

function toQuizInfoPublic(quiz: QuizInfo): QuizInfoPublic {
  return {
    passed: quiz.passed,
    tries: quiz.tries,
    lastAttemptedAt: quiz.lastAttemptedAt?.toISOString(),
  }
}

function toCertificationsPublic(
  certifications: Certifications
): CertificationsPublic {
  return Object.fromEntries(
    Object.entries(certifications).map(([subject, quiz]) => [
      subject,
      toQuizInfoPublic(quiz),
    ])
  )
}

function toReferencePublic(reference: Reference): ReferencePublic {
  return {
    id: reference.id,
    firstName: reference.firstName,
    lastName: reference.lastName,
    createdAt: reference.createdAt.toISOString(),
    email: reference.email,
    status: reference.status,
    sentAt: reference.sentAt?.toISOString(),
    affiliation: reference.affiliation,
    relationshipLength: reference.relationshipLength,
    patient: reference.patient,
    positiveRoleModel: reference.positiveRoleModel,
    agreeableAndApproachable: reference.agreeableAndApproachable,
    communicatesEffectively: reference.communicatesEffectively,
    trustworthyWithChildren: reference.trustworthyWithChildren,
    rejectionReason: reference.rejectionReason,
    additionalInfo: reference.additionalInfo,
  }
}

export function toPostsessionSurveyRatingsMetricPublic(
  ratings: PostsessionSurveyRatingsMetric
): PostsessionSurveyRatingsMetricPublic {
  return {
    selfReportedStudentRating: {
      total: ratings.selfReportedStudentRating.total,
      average: ratings.selfReportedStudentRating.average,
    },
    selfReportedVolunteerRating: {
      total: ratings.selfReportedVolunteerRating.total,
      average: ratings.selfReportedVolunteerRating.average,
    },
    partnerReportedStudentRating: {
      total: ratings.partnerReportedStudentRating.total,
      average: ratings.partnerReportedStudentRating.average,
    },
    partnerReportedVolunteerRating: {
      total: ratings.partnerReportedVolunteerRating.total,
      average: ratings.partnerReportedVolunteerRating.average,
    },
    selfReportedRating: {
      total: ratings.selfReportedRating.total,
      average: ratings.selfReportedRating.average,
    },
    partnerReportedRating: {
      total: ratings.partnerReportedRating.total,
      average: ratings.partnerReportedRating.average,
    },
  }
}

function toSponsorshipPublic(sponsorship: Sponsorship): SponsorshipPublic {
  return {
    id: sponsorship.id,
    name: sponsorship.name,
    key: sponsorship.key,
  }
}

export function toLegacyUserPublic(user: LegacyUserModel): LegacyUserPublic {
  return {
    id: user.id,
    _id: user.id,
    firstName: user.firstName,
    firstname: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    proxyEmail: user.proxyEmail,
    verified: user.verified,
    phone: user.phone,
    college: user.college,
    userType: user.userType,
    isBanned: user.banType === 'complete',
    banType: user.banType,
    banReason: user.banReason,
    roleContext: toRoleContextPublic(user.roleContext),
    isTestUser: user.isTestUser,
    isFakeUser: user.isFakeUser,
    isDeactivated: user.isDeactivated,
    pastSessions: user.pastSessions,
    lastActivityAt: user.lastActivityAt?.toISOString(),
    referralCode: user.referralCode,
    numReferredVolunteers: user.numReferredVolunteers,
    referredBy: user.referredBy,
    sessionStats: toUserSessionStatsPublic(user.sessionStats),
    preferredLanguage: user.preferredLanguage,
    signupSource: user.signupSource,
    isOnboarded: user.isOnboarded,
    isApproved: user.isApproved,
    volunteerPartnerOrg: user.volunteerPartnerOrg,
    subjects: user.subjects,
    activeSubjects: user.activeSubjects,
    mutedSubjectAlerts: user.mutedSubjectAlerts,
    totalActiveCertifications: user.totalActiveCertifications,
    availability: user.availability,
    certifications: user.certifications
      ? toCertificationsPublic(user.certifications)
      : undefined,
    availabilityLastModifiedAt: user.availabilityLastModifiedAt?.toISOString(),
    trainingCourses: user.trainingCourses
      ? toTrainingCoursesPublic(user.trainingCourses)
      : undefined,
    occupation: user.occupation,
    country: user.country,
    timezone: user.timezone,
    totalVolunteerHours: user.totalVolunteerHours,
    hoursTutored: user.hoursTutored,
    hoursTutoredThisWeek: user.hoursTutoredThisWeek,
    elapsedAvailability: user.elapsedAvailability,
    references: user.references?.map(toReferencePublic),
    photoIdStatus: user.photoIdStatus,
    uniqueStudentsHelpedCount: user.uniqueStudentsHelpedCount,
    hasCompletedVolunteerTraining: user.hasCompletedVolunteerTraining,
    gradeLevel: user.gradeLevel,
    schoolName: user.schoolName,
    latestRequestedSubjects: user.latestRequestedSubjects,
    numberOfStudentClasses: user.numberOfStudentClasses,
    issuers: user.issuers,
    studentPartnerOrg: user.studentPartnerOrg,
    isSchoolPartner: user.isSchoolPartner,
    usesClever: user.usesClever,
    usesGoogle: user.usesGoogle,
    usesClassLink: user.usesClassLink,
    studentAssignments: user.studentAssignments?.map(toStudentAssignmentPublic),
    ratings: user.ratings
      ? toPostsessionSurveyRatingsMetricPublic(user.ratings)
      : undefined,
    favoriteVolunteers: user.favoriteVolunteers,
    lastSuccessfulCleverSync: user.lastSuccessfulCleverSync?.toISOString(),
    sponsorships: user.sponsorships?.map(toSponsorshipPublic),
  }
}
