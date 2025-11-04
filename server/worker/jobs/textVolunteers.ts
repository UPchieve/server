import { Job } from 'bull'
import Case from 'case'
import { differenceBy, sampleSize } from 'lodash'
import config from '../../config'
import logger from '../../logger'
import { SUBJECTS } from '../../constants'
import startsWithVowel from '../../utils/starts-with-vowel'
import { Ulid, Uuid } from '../../models/pgUtils'
import { Jobs } from './index'
import type { TextableVolunteer as TextableVolunteerDbResult } from '../../models/Volunteer'
import * as SubjectsService from '../../services/SubjectsService'
import * as AssociatedPartnerService from '../../services/AssociatedPartnerService'
import * as CacheService from '../../cache'
import * as FavoritingService from '../../services/FavoritingService'
import * as NotificationService from '../../services/NotificationService'
import * as SessionService from '../../services/SessionService'
import * as TwilioService from '../../services/TwilioService'
import * as QueueService from '../../services/QueueService'
import {
  TEXTABLE_VOLUNTEERS_CACHE_KEY,
  getAndCacheAvailableVolunteers,
} from './updateCachedVolunteersForTextNotifications'
import { secondsInMs } from '../../utils/time-utils'

const HIGH_LEVEL_SUBJECTS = new Set<SUBJECTS>([
  SUBJECTS.CALCULUS_AB,
  SUBJECTS.STATISTICS,
  SUBJECTS.PHYSICS_ONE,
])
const MAX_NOTIFICATION_ROUNDS = 5

export type TextVolunteersJobData = {
  notificationRound: number
  sessionId: string
  subject: string
  subjectDisplayName: string
  topic: string
  studentId: string
  schoolId?: string
  studentPartnerOrg?: string
}
export enum PriorityGroupName {
  // These strings need to match the notification_priority_groups in the DB exactly
  FAVORITE = 'Favorite volunteers',
  PARTNER = 'Associated partner volunteers',
  REGULAR = 'Regular volunteers',
}
export type TextableVolunteer = TextableVolunteerDbResult & {
  priorityGroupName?: PriorityGroupName
}
export type PriorityGroup = {
  name: PriorityGroupName
  volunteers: TextableVolunteer[]
}

export default async function textVolunteers(
  job: Job<TextVolunteersJobData>
): Promise<void> {
  const notificationRound = job.data.notificationRound
  const sessionId = job.data.sessionId
  const subject = job.data.subject as SUBJECTS
  const subjectDisplayName = job.data.subjectDisplayName
  const topic = job.data.topic
  const studentId = job.data.studentId
  const schoolId = job.data.schoolId
  const studentPartnerOrg = job.data.studentPartnerOrg

  logger.info(
    {
      sessionId,
      notificationRound,
    },
    `TextVolunteers: Processing round ${notificationRound}`
  )

  const isSessionFulfilled = await SessionService.isSessionFulfilled(sessionId)
  if (isSessionFulfilled) {
    logger.info({ sessionId }, 'Session fulfilled.')
    return
  }

  const allTextableVolunteers = await getTextableVolunteers()

  const computedSubjectRequirements =
    await SubjectsService.getCachedComputedSubjectUnlocks()
  const subjectRequiresHighLevelSubjectCerts =
    (subject as SUBJECTS) in computedSubjectRequirements
  const eligibleVolunteers = filterSubjectEligibleVolunteers(
    allTextableVolunteers,
    subject,
    subjectRequiresHighLevelSubjectCerts
  )
  const { volunteers: eligiblePartnerVolunteers, studentOrgDisplay } =
    (await filterPartnerVolunteers(
      eligibleVolunteers,
      studentPartnerOrg,
      schoolId
    )) ?? { volunteers: [] }
  const eligibleFavoritedVolunteers = await filterFavoritedVolunteers(
    eligibleVolunteers,
    studentId
  )

  const selectedTutors = await selectVolunteersByPriority(subject, [
    {
      name: PriorityGroupName.FAVORITE,
      volunteers: eligibleFavoritedVolunteers,
    },
    {
      name: PriorityGroupName.PARTNER,
      volunteers: eligiblePartnerVolunteers,
    },
    { name: PriorityGroupName.REGULAR, volunteers: eligibleVolunteers },
  ])

  if (!selectedTutors.length) {
    logger.warn(
      { sessionId, subject },
      'No volunteers found to text for session.'
    )
    return
  }

  await sendTextMessages(
    selectedTutors,
    {
      sessionId,
      subject,
      subjectDisplayName,
      topic,
    },
    studentOrgDisplay
  )

  if (notificationRound <= MAX_NOTIFICATION_ROUNDS) {
    await QueueService.add(
      Jobs.TextVolunteers,
      {
        ...job.data,
        notificationRound: notificationRound + 1,
      },
      { delay: secondsInMs(30) }
    )
  }
}

async function getTextableVolunteers(): Promise<TextableVolunteer[]> {
  const cachedVolunteers = await CacheService.getIfExists(
    TEXTABLE_VOLUNTEERS_CACHE_KEY
  )
  if (cachedVolunteers) return JSON.parse(cachedVolunteers)

  logger.warn(`No cached ${TEXTABLE_VOLUNTEERS_CACHE_KEY}. Fetching now.`)
  return getAndCacheAvailableVolunteers()
}

/**
 * (Exported for testing.)
 *
 * This function filters the given volunteers based off of their subject certification eligibility. A volunteer must have
 * the given subject's certification to be eligible.
 *
 * In addition, if the volunteer has ANY high level subject certification, we actually want to consider them INELIGIBLE
 * so that we can reserve them for those subject requests. This behavior can be overridden with the `allowHighLevelVolunteers`
 * param. An example of when we'd want to override this is with the computed subjects (subjects that require multiple
 * certifications for you to be able to coach in them), such as Integrated Math One, which actually DOES require you to
 * have a high level subject certification (Statistics).
 *
 * @param volunteers - The volunteer list to filter, will not be modified by this function
 * @param subject - The requested subject
 * @param allowHighLevelVolunteers - When true, volunteers with high level subject certs will NOT be considered ineligible.
 * Default false.
 */
export function filterSubjectEligibleVolunteers(
  volunteers: TextableVolunteer[],
  subject: SUBJECTS,
  allowHighLevelVolunteers = false
) {
  const isHighLevelSubject = HIGH_LEVEL_SUBJECTS.has(subject)

  return volunteers.filter((c) => {
    const canTutorInSubject = c.unlockedSubjects.includes(subject)
    // If the volunteer has high level subject certs, we want to reserve them for when those sessions are requested.
    // This behavior can be overriden by `allowHighLevelVolunteers`
    if (canTutorInSubject && allowHighLevelVolunteers) return true

    const hasMutedSubject = c.mutedSubjects.includes(subject)
    if (!canTutorInSubject || hasMutedSubject) return false
    if (canTutorInSubject && isHighLevelSubject) return true

    const canTutorHighLevelSubjects = c.unlockedSubjects.some((s) =>
      HIGH_LEVEL_SUBJECTS.has(s as SUBJECTS)
    )
    return !canTutorHighLevelSubjects
  })
}

// Exported for testing.
export async function filterPartnerVolunteers(
  volunteers: TextableVolunteer[],
  studentPartnerOrg?: string,
  schoolId?: string
): Promise<
  { studentOrgDisplay?: string; volunteers: TextableVolunteer[] } | undefined
> {
  const associatedPartner = await AssociatedPartnerService.getAssociatedPartner(
    studentPartnerOrg,
    schoolId
  )
  if (!associatedPartner) return

  return {
    volunteers: volunteers.filter((v) => {
      return v.volunteerPartnerOrgKey === associatedPartner.volunteerPartnerOrg
    }),
    studentOrgDisplay: associatedPartner?.studentOrgDisplay,
  }
}

// Exported for testing.
export async function filterFavoritedVolunteers(
  volunteers: TextableVolunteer[],
  studentId: Ulid
): Promise<TextableVolunteer[]> {
  if (!volunteers.length) return []

  const favoritedIds = await FavoritingService.getFavoritedVolunteerIdsFromList(
    studentId,
    volunteers
  )
  return volunteers.filter((v) => favoritedIds.has(v.id))
}

// Exported for testing.
export const subjectToNumberOfTexts: Partial<Record<SUBJECTS, number>> = {
  // TODO: Figure out the actual numbers and add more.
  //     Do we just want to make this more for HIGH_LEVEL_SUBJECTS only?
  [SUBJECTS.CALCULUS_AB]: 3,
  [SUBJECTS.STATISTICS]: 3,
  [SUBJECTS.PHYSICS_ONE]: 3,
}
// Exported for testing.
export async function selectVolunteersByPriority(
  subject: SUBJECTS,
  priorityGroups: PriorityGroup[]
): Promise<TextableVolunteer[]> {
  const n = subjectToNumberOfTexts[subject] ?? 2

  const filteredPriorityGroups =
    await filterEligibleVolunteersToText(priorityGroups)

  const toText: TextableVolunteer[] = []
  for (const group of filteredPriorityGroups) {
    if (toText.length >= n) break
    if (group.volunteers.length > 0) {
      // Get volunteers in this group that haven't been selected yet
      // from a previous priority group.
      const uniqueVolunteers = differenceBy(group.volunteers, toText, 'id')
      const selected = sampleSize(uniqueVolunteers, n - toText.length)
      toText.push(
        ...selected.map((v) => ({
          ...v,
          priorityGroupName: group.name,
        }))
      )
    }
  }
  return toText
}

async function filterEligibleVolunteersToText(
  priorityGroups: PriorityGroup[]
): Promise<PriorityGroup[]> {
  const volunteersInSessions = await SessionService.getVolunteersInSessions()
  const volunteersRecentlyNotified =
    await NotificationService.getVolunteersTextedSince5MinutesAgo()

  return priorityGroups.map((group) => ({
    name: group.name,
    volunteers: group.volunteers.filter(
      (v) =>
        !volunteersInSessions.has(v.id) && !volunteersRecentlyNotified.has(v.id)
    ),
  }))
}

type SessionForTextMessage = {
  sessionId: Uuid
  subject: string
  topic: string
  subjectDisplayName: string
}
// Exported for testing.
export async function sendTextMessages(
  volunteers: TextableVolunteer[],
  session: SessionForTextMessage,
  studentOrgDisplay?: string
) {
  await Promise.all(
    volunteers.map(async (v) => {
      const content = buildContent(
        v.firstName,
        v.priorityGroupName === PriorityGroupName.PARTNER
          ? studentOrgDisplay
          : undefined
      )
      const carrierMessageId = await TwilioService.sendTextMessage(
        v.phone,
        content,
        session.sessionId
      )
      await SessionService.addSessionSmsNotification(
        session.sessionId,
        v.id,
        v.priorityGroupName,
        carrierMessageId
      )
    })
  )

  function buildContent(
    volunteerFirstName: string,
    studentOrgDisplay?: string
  ) {
    let studentDescription: string = 'a student'
    if (studentOrgDisplay) {
      const article = startsWithVowel(studentOrgDisplay) ? 'an' : 'a'
      studentDescription = `${article} ${studentOrgDisplay} student`
    }
    return `Hi ${volunteerFirstName}, ${studentDescription} needs help in ${session.subjectDisplayName} on UPchieve! ${buildSessionUrl(session)}`
  }

  function buildSessionUrl(session: SessionForTextMessage) {
    const { topic, subject, sessionId } = session
    return `${config.protocol}://${config.client.host}/session/${Case.kebab(
      topic
    )}/${Case.kebab(subject)}/${sessionId}`
  }
}
