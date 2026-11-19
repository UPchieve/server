import * as PresenceService from '../PresenceService'
import * as FeatureFlagService from '../FeatureFlagService'
import * as VolunteerRepo from '../../models/Volunteer'
import * as SessionRepo from '../../models/Session'
import { SUBJECTS } from '../../constants/subjects'
import { filterAsync } from '../../utils/filter-async'
import { canCoachSubject } from '../../utils/coach-utils'
import * as Queue from './queue'
import type { QueueUser } from './queue'

export async function eligibleCoaches(subject: SUBJECTS): Promise<QueueUser[]> {
  // The top coach needs to be (1) eligible for the subject, (2) in the queue, (3) actively online right now
  // There is a grace period if a user disconnects/goes inactive before we kick them out of the queue
  // But if we're going to select the top coach to make an offer to, we should ensure that they are
  // connected/present right *now* (i.e. don't send out offers while they are maybe momentarily disconnected
  const onlineIds = new Set(await PresenceService.getOnlineUsers('volunteer'))
  const queuedOnlineCoaches = (await Queue.getQueueUsers()).filter(
    ({ userId }) => onlineIds.has(userId)
  )
  if (!queuedOnlineCoaches.length) return []

  const coachData = await VolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds(
    queuedOnlineCoaches.map(({ userId }) => userId)
  )
  const unavailable = await SessionRepo.getVolunteersInOrRequestedForSessions()
  const availableCoacheIds = new Set(
    coachData
      .filter(
        (coach) =>
          canCoachSubject(coach, subject) && !unavailable.includes(coach.userId)
      )
      .map(({ userId }) => userId)
  )

  /**
   * @NOTE at some point we might want `unlockedSubjects`
   * for opportunity cost scoring. for now, just return
   * `inQueueSince`
   */
  const availableCoaches = queuedOnlineCoaches.filter(({ userId }) =>
    availableCoacheIds.has(userId)
  )
  return (
    await filterAsync(availableCoaches, ({ userId }) =>
      FeatureFlagService.isInSessionOffersTestGroup(userId)
    )
  ).filtered
}
