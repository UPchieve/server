import * as PresenceService from '../PresenceService'
import * as FeatureFlagService from '../FeatureFlagService'
import * as VolunteerRepo from '../../models/Volunteer'
import * as SessionRepo from '../../models/Session'
import { SUBJECTS } from '../../constants/subjects'
import { filterAsync } from '../../utils/filter-async'

export async function eligibleCoaches(subject: SUBJECTS) {
  const onlineCoaches = await PresenceService.getOnlineUsers('volunteer')

  if (!onlineCoaches.length) return []

  const coachData = await VolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds(
    onlineCoaches.map(({ userId }) => userId)
  )
  const unavailable = await SessionRepo.getVolunteersInOrRequestedForSessions()
  const availableCoacheIds = new Set(
    coachData
      .filter(
        (coach) =>
          coach.isReadyToCoach &&
          coach.banType !== 'complete' &&
          coach.banType !== 'shadow' &&
          !coach.isDeactivated &&
          !unavailable.includes(coach.userId) &&
          coach.unlockedSubjects.includes(subject) &&
          !coach.mutedSubjects.includes(subject)
      )
      .map(({ userId }) => userId)
  )

  /**
   * @NOTE at some point we might want `unlockedSubjects`
   * for opportunity cost scoring. for now, just return
   * `onlineSince`
   */
  const availableCoaches = onlineCoaches.filter(({ userId }) =>
    availableCoacheIds.has(userId)
  )
  return (
    await filterAsync(availableCoaches, ({ userId }) =>
      FeatureFlagService.isInSessionOffersTestGroup(userId)
    )
  ).filtered
}
