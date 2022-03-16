import { Ulid } from '../pgUtils'
import { USER_BAN_REASON } from '../../constants'
import { Reference, Certifications, TrainingCourses } from '../Volunteer'
import { Availability } from '../Availability/types'
import { RepoReadError } from '../Errors'

export type LegacyUserModel = {
  // pg
  id: Ulid
  firstName: string
  // mongo user
  _id: Ulid
  createdAt: Date
  email: string
  password: string
  verified: boolean
  passwordResetToken?: string
  firstname: string
  phone?: string
  college?: string
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: USER_BAN_REASON
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Ulid[]
  partnerUserId?: string
  lastActivityAt: Date
  referralCode: string
  referredBy?: Ulid
  type: string
  // volunteer
  isOnboarded: boolean
  isApproved: boolean
  volunteerPartnerOrg: string
  subjects: string[]
  availability: Availability
  certifications: Certifications
  availabilityLastModifiedAt: Date
  trainingCourses: TrainingCourses
  occupation: string[]
  country: string
  timezone: string
  totalVolunteerHours: number
  hoursTutored: number
  elapsedAvailability: number
  references: Reference[]
  photoIdStatus: string
}

/*
TODO: still need
    subjects: string[] 
    certifications: Certifications
    trainingCourses: TrainingCourses 

    availability: Availability 
    availabilityLastModifiedAt: Date 

    references: Reference[] 
  
    totalVolunteerHours: number - needs schema change for verizon volunteers profiles
    occupation: string[] - needs schema change to volunteer profiles
    elapsedAvailability: number - needs schema change to track using legacy system

BACKEND (req.user)
_id x
lastActivityAt x
isAdmin x
isOnboarded x
volunterrPartnerOrg x
subjects x
availability x
isVolunteer x
isBanned x
email x
firstname x
certifications x
availabilityLastModifiedAt x
trainingCourses x
isDeactivated x

FRONTEND (state.user.user which is populated by the same method as req.user above)
omit(['references', 'photoIdS3Key', 'photoIdStatus'])
subjects x
_id x
referralCode x
certifications x
trainingCourses x
isVolunteer x
isApproved x
isOnboarded x
firstname x
email x
type x
isBanned x
occupation x
country x
timezone x
availability x
phone x
isDeactivated x
verified x
pastSessions.length x
totalVolunteerHours x
hoursTutored x
elapsedAvailability x
references x
photoIsStatus x
createdAt x
isTestUser x
. (entire user re-emitted to socket on session join and new message)
  - message needs _id and isVolunteer
  - join need isVolunteer, isApproved, and _id


*/

export async function getLegacyUserObject(
  userId: Ulid
): Promise<LegacyUserModel | undefined> {
  try {
    return
  } catch (err) {
    throw new RepoReadError(err)
  }
}

/*

SELECT
    users.id,
    users.first_name,
    users.created_at,
    users.email,
    users.verified,
    users.first_name AS firstname,
    users.phone,
    volunteer_profiles.college,
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_volunteer,
    (CASE WHEN admin_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_admin,
    users.banned AS isBanned,
    ban_reasons.name AS banReason,
    users.test_user AS isTestUser,
    false AS isFakeUser,
    users.deactivated AS isDeactivated,
    users.last_activity_at AS lastActivityAt,
    users.referral_code AS referralCode,
    users.referred_by AS referredBy,
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN 'volunteer'
         ELSE 'student'
    END) as type,
    volunteer_profiles.onboarded AS isOnboarded,
    volunteer_profiles.approved AS isApproved,
    volunteer_partner_orgs.name AS volunteerPartnerOrg,
    volunteer_profiles.country,
    volunteer_profiles.timezone,
    volunteer_profiles.photo_id_status AS photoIdStatus,
    past_sessions.sessions AS pastSessions,
    round(past_sessions.time_tutored/3600000::numeric, 2) AS hoursTutored
FROM users
LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
LEFT JOIN (
  SELECT
    array_agg(subjects_unlocked.subject) AS subjects
  FROM (
      SELECT
          subjects.name AS subject,
          COUNT(*)::int AS earned_certs,
          subject_certs.total
      FROM
          users_certifications
          JOIN certification_subject_unlocks USING (certification_id)
          JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
          JOIN users ON users.id = users_certifications.user_id
          JOIN (
              SELECT
                  subjects.name,
                  COUNT(*)::int AS total
              FROM
                  certification_subject_unlocks
                  JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
              GROUP BY
                  subjects.name
          ) AS subject_certs ON subject_certs.name = subjects.name
      WHERE
          users.id = '017F8F3748284DEAC13784F0B7D7E8C9'
      GROUP BY
          subjects.name, subject_certs.total
      HAVING
          COUNT(*)::int >= subject_certs.total) AS subjects_unlocked
) AS total_subjects ON true
LEFT JOIN (
  SELECT
  	array_agg(id) AS sessions,
  	sum(time_tutored)::int AS time_tutored
  FROM
  	sessions
  WHERE
  	student_id = '017F8F3748284DEAC13784F0B7D7E8C9' OR
  	volunteer_id = '017F8F3748284DEAC13784F0B7D7E8C9'
) AS past_sessions ON true
WHERE
    users.id = '017F8F3748284DEAC13784F0B7D7E8C9';

*/
