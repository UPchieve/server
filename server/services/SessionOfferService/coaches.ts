import * as PresenceService from '../PresenceService'
import * as VolunteerRepo from '../../models/Volunteer'
import * as SessionRepo from '../../models/Session'
import * as MatchScoringService from '../MatchScoringService'
import { SUBJECTS } from '../../constants/subjects'

export async function eligibleCoaches(subject: SUBJECTS) {
  const onlineCoaches = await PresenceService.getOnlineUsers('volunteer')

  if (!onlineCoaches.length) return []

  const coachData = await VolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds(
    onlineCoaches.map(({ userId }) => userId)
  )
  const inSessions = await SessionRepo.getVolunteersInSessions()
  const availableCoacheIds = new Set(
    coachData
      .filter(
        (coach) =>
          coach.isReadyToCoach &&
          coach.banType !== 'complete' &&
          coach.banType !== 'shadow' &&
          !coach.isDeactivated &&
          !inSessions.includes(coach.userId) &&
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
  return onlineCoaches.filter(({ userId }) => availableCoacheIds.has(userId))
}

/*
 * onlineAndWaitingInMs = now - max(onlineSince, lastSessionEndedAt)
 *
 * coaches without an onlineSince are skipped since we can't tell how long
 * they've been waiting (see PresenceService.OnlineUser)
 */
export async function calculateOnlineAndWaitingInMs(
  coaches: PresenceService.OnlineUser[]
): Promise<MatchScoringService.ScoringCandidate[]> {
  const lastSessions = await SessionRepo.getLastSessionEndedAtByVolunteerIds(
    coaches.map(({ userId }) => userId)
  )
  const lastSessionEndedAtByCoachId = new Map(
    lastSessions.map(({ volunteerId, endedAt }) => [volunteerId, endedAt])
  )
  const now = Date.now()

  return coaches.flatMap(({ userId, onlineSince }) => {
    if (!onlineSince) return []

    const lastSessionEndedAt = lastSessionEndedAtByCoachId.get(userId)
    const waitingSince = Math.max(
      onlineSince.getTime(),
      lastSessionEndedAt?.getTime() ?? 0
    )
    return [{ volunteerId: userId, onlineAndWaitingInMs: now - waitingSince }]
  })
}
