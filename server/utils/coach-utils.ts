import { SUBJECTS } from '../constants/subjects'
import { VolunteerSessionHoldEligibilityData } from '../models/Volunteer/types'
import { isPlatformBanType } from './ban-utils'

export function canCoach(coach: VolunteerSessionHoldEligibilityData): boolean {
  return (
    coach.isReadyToCoach &&
    !isPlatformBanType(coach.banType) &&
    !coach.isDeactivated
  )
}

export function canCoachSubject(
  coach: VolunteerSessionHoldEligibilityData,
  subject: SUBJECTS
): boolean {
  return (
    canCoach(coach) &&
    coach.unlockedSubjects.includes(subject) &&
    !coach.mutedSubjects.includes(subject)
  )
}
