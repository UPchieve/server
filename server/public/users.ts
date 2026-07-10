import type {
  CertificationsPublic,
  LegacyUserPublic,
  PastSessionForAdminPublic,
  PostsessionSurveyRatingsMetricPublic,
  QuizInfoPublic,
  ReferenceContactInfoPublic,
  ReferencePublic,
  RoleContextPublic,
  SponsorshipPublic,
  UserAdminBackgroundPublic,
  UserForAdminDetailPublic,
  UserForAdminDetailWithRoleContextPublic,
  UserForAdminPublic,
  UserSessionStatsPublic,
} from '../contracts/users'
import type { UserSessionStats } from '../models/Session'
import type { PastSessionForAdmin, UserForAdmin } from '../models/User'
import type { LegacyUserModel } from '../models/User/legacy-user'
import {
  QuizInfo,
  Certifications,
  Reference,
  Sponsorship,
  ReferenceContactInfo,
} from '../models/Volunteer'
import type { PostsessionSurveyRatingsMetric } from '../services/SurveyService'
import type { RoleContext } from '../services/UserRolesService'
import {
  UserAdminBackground,
  UserForAdminDetail,
  UserForAdminDetailWithRoleContext,
} from '../types/users'
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

export function toReferenceContactInfoPublic(
  reference: ReferenceContactInfo
): ReferenceContactInfoPublic {
  return {
    id: reference.id,
    status: reference.status,
    email: reference.email,
    firstName: reference.firstName,
    lastName: reference.lastName,
    affiliation: reference.affiliation,
    additionalInfo: reference.additionalInfo,
    agreeableAndApproachable: reference.agreeableAndApproachable,
    communicatesEffectively: reference.communicatesEffectively,
    patient: reference.patient,
    positiveRoleModel: reference.positiveRoleModel,
    rejectionReason: reference.rejectionReason,
    relationshipLength: reference.relationshipLength,
    trustworthyWithChildren: reference.trustworthyWithChildren,
  }
}

export function toUserAdminBackgroundPublic(
  background: UserAdminBackground
): UserAdminBackgroundPublic {
  return {
    occupation: background.occupation,
    experience: background.experience,
    languages: background.languages,
    linkedInUrl: background.linkedInUrl,
    country: background.country,
    state: background.state,
    city: background.city,
    college: background.college,
    company: background.company,
  }
}

export function toPastSessionForAdminPublic(
  session: PastSessionForAdmin
): PastSessionForAdminPublic {
  return {
    id: session.id,
    _id: session.id,
    type: session.type,
    subTopic: session.subTopic,
    totalMessages: session.totalMessages,
    volunteer: session.volunteer,
    student: session.student,
    volunteerJoinedAt: session.volunteerJoinedAt?.toISOString(),
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
  }
}

export function toUserForAdminDetailPublic(
  user: UserForAdminDetail
): UserForAdminDetailPublic {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    isDeactivated: user.isDeactivated,
    isDeleted: user.isDeleted,
    isTestUser: user.isTestUser,
    verified: user.verified,
    banType: user.banType,
    numPastSessions: user.numPastSessions,
    isApproved: user.isApproved,
    isOnboarded: user.isOnboarded,
    volunteerPartnerOrg: user.volunteerPartnerOrg,
    photoIdS3Key: user.photoIdS3Key,
    photoIdStatus: user.photoIdStatus,
    currentGrade: user.currentGrade,
    zipCode: user.zipCode,
    studentPartnerOrg: user.studentPartnerOrg,
    partnerSite: user.partnerSite,
    schoolId: user.schoolId,
    schoolName: user.schoolName,
    references: user.references.map(toReferenceContactInfoPublic),
    pastSessions: user.pastSessions?.map(toPastSessionForAdminPublic),
    background: toUserAdminBackgroundPublic(user.background),
  }
}

export function toUserForAdminDetailWithRoleContextPublic(
  user: UserForAdminDetailWithRoleContext
): UserForAdminDetailWithRoleContextPublic {
  return {
    ...toUserForAdminDetailPublic(user),
    roleContext: toRoleContextPublic(user.roleContext),
    photoUrl: user.photoUrl,
    userType: user.roleContext.legacyRole,
    roles: user.roleContext.roles,
  }
}

export function toUserForAdminPublic(user: UserForAdmin): UserForAdminPublic {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
    createdAt: user.createdAt?.toISOString(),
  }
}
