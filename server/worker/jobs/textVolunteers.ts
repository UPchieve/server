import { Job } from 'bull'
import Case from 'case'
import { differenceBy, sampleSize } from 'lodash'
import config from '../../config'
import logger from '../../logger'
import { SUBJECTS } from '../../constants'
import startsWithVowel from '../../utils/starts-with-vowel'
import { Ulid, Uuid } from '../../models/pgUtils'
import type { TextableVolunteer as TextableVolunteerDbResult } from '../../models/Volunteer'
import * as AssociatedPartnerService from '../../services/AssociatedPartnerService'
import * as CacheService from '../../cache'
import * as FavoritingService from '../../services/FavoritingService'
import * as SessionService from '../../services/SessionService'
import * as TwilioService from '../../services/TwilioService'
import {
  TEXTABLE_VOLUNTEERS_CACHE_KEY,
  getAndCacheAvailableVolunteers,
} from './updateCachedVolunteersForTextNotifications'

const HIGH_LEVEL_SUBJECTS = new Set<SUBJECTS>([
  SUBJECTS.CALCULUS_AB,
  SUBJECTS.STATISTICS,
  SUBJECTS.PHYSICS_ONE,
])

export type TextVolunteersJobData = {
  sessionId: string
  subject: string
  subjectDisplayName: string
  topic: string
  studentId: string
  schoolId?: string
  studentPartnerOrg?: string
}
export type TextableVolunteer = TextableVolunteerDbResult & {
  studentOrgDisplay?: string
}

export default async function textVolunteers(
  job: Job<TextVolunteersJobData>
): Promise<void> {
  const sessionId = job.data.sessionId
  const subject = job.data.subject as SUBJECTS
  const subjectDisplayName = job.data.subjectDisplayName
  const topic = job.data.topic
  const studentId = job.data.studentId
  const schoolId = job.data.schoolId
  const studentPartnerOrg = job.data.studentPartnerOrg

  const allTextableVolunteers = await getTextableVolunteers()

  const eligibleVolunteers = filterSubjectEligibleVolunteers(
    allTextableVolunteers,
    subject
  )
  const eligiblePartnerVolunteers = await filterPartnerVolunteers(
    eligibleVolunteers,
    studentPartnerOrg,
    schoolId
  )
  const eligibleFavoritedVolunteers = await filterFavoritedVolunteers(
    eligibleVolunteers,
    studentId
  )

  const selectedTutors = await selectVolunteersByPriority(
    subject,
    eligibleFavoritedVolunteers,
    eligiblePartnerVolunteers ?? [],
    eligibleVolunteers
  )

  if (!selectedTutors.length) {
    logger.warn(
      { sessionId, subject },
      'No volunteers found to text for session.'
    )
    return
  }

  await sendTextMessages(selectedTutors, {
    sessionId,
    subject,
    subjectDisplayName,
    topic,
  })
  // TODO: Add notification to db.
  // TODO: Queue TextVolunters job again.
}

async function getTextableVolunteers(): Promise<TextableVolunteer[]> {
  const cachedVolunteers = await CacheService.getIfExists(
    TEXTABLE_VOLUNTEERS_CACHE_KEY
  )
  if (cachedVolunteers) return JSON.parse(cachedVolunteers)

  logger.warn(`No cached ${TEXTABLE_VOLUNTEERS_CACHE_KEY}. Fetching now.`)
  return getAndCacheAvailableVolunteers()
}

// Exported for testing.
export function filterSubjectEligibleVolunteers(
  volunteers: TextableVolunteer[],
  subject: SUBJECTS
) {
  const isHighLevelSubject = HIGH_LEVEL_SUBJECTS.has(subject)

  return volunteers.filter((c) => {
    const canTutorInSubject = c.unlockedSubjects.includes(subject)
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
) {
  const associatedPartner = await AssociatedPartnerService.getAssociatedPartner(
    studentPartnerOrg,
    schoolId
  )
  if (!associatedPartner) return

  return volunteers
    .filter((v) => {
      return v.volunteerPartnerOrgKey === associatedPartner.volunteerPartnerOrg
    })
    .map((v) => ({
      ...v,
      studentOrgDisplay: associatedPartner.studentOrgDisplay,
    }))
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
  [SUBJECTS.CALCULUS_AB]: 3,
}
// Exported for testing.
export async function selectVolunteersByPriority(
  subject: SUBJECTS,
  ...priorityGroupsInOrder: TextableVolunteer[][]
): Promise<TextableVolunteer[]> {
  const n = subjectToNumberOfTexts[subject] ?? 2

  const filteredPriorityGroups = await filterVolunteersNotInSession(
    priorityGroupsInOrder
  )

  const toText: TextableVolunteer[] = []
  for (const group of filteredPriorityGroups) {
    if (toText.length >= n) break
    if (group.length > 0) {
      // Get volunteers in this group that haven't been selected yet
      // from a previous priority group.
      const uniqueVolunteers = differenceBy(group, toText, 'id')
      toText.push(...sampleSize(uniqueVolunteers, n - toText.length))
    }
  }
  return toText
}

async function filterVolunteersNotInSession(volunteers: TextableVolunteer[][]) {
  const volunteersInSessions = await SessionService.getVolunteersInSessions()
  return volunteers.map((group) =>
    group.filter((v) => !volunteersInSessions.has(v.id))
  )
}

type SessionForTextMessage = {
  sessionId: Uuid
  subject: string
  topic: string
  subjectDisplayName: string
}
async function sendTextMessages(
  volunteers: TextableVolunteer[],
  session: SessionForTextMessage
) {
  await Promise.all(
    volunteers.map((v) => {
      const content = buildContent(v.firstName, v.studentOrgDisplay)
      return TwilioService.sendTextMessage(v.phone, content)
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
