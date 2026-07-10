import type { AnalyticPersonPropertiesPublic } from './analytics'
import type { NTHSGroupJoinPublic, NTHSGroupWithMemberInfoPublic } from './nths'
import type { TeacherClassPublic } from './teachers'

export type StudentClassResponse =
  | { teacherClass: TeacherClassPublic }
  | { isExistingStudent: boolean }

export type NTHSJoinGroupResponse =
  | {
      NTHSGroup: NTHSGroupWithMemberInfoPublic
    }
  | {
      groups: NTHSGroupWithMemberInfoPublic[]
    }
  | {
      isExistingVolunteer: boolean | null
    }

export type NTHSInviteCodeResponse = {
  NTHSGroup: NTHSGroupJoinPublic
}

// TODO: Refactor to only use `NTHSInviteCodeResponse`?
export type NTHSInviteCodeInvitationResponse = {
  NTHSgroup: NTHSGroupJoinPublic | null
}

export type ContactSubmissionResponse =
  | {
      message: 'contact form submission has been sent'
    }
  | { error: string }

export type FeatureFlagResponse =
  | {
      id: string
      featureFlags: Record<string, string | boolean>
      featureFlagPayloads: Record<string, unknown>
      personProperties: AnalyticPersonPropertiesPublic | null
    }
  | {
      id: string
    }
