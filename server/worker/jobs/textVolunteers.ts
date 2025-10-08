import { Job } from 'bull'
import { sampleSize } from 'lodash'
import { Ulid, Uuid } from '../../models/pgUtils'
import { getClient } from '../../db'
import logger from '../../logger'
import { SUBJECTS } from '../../constants'
import * as AssociatedPartnerService from '../../services/AssociatedPartnerService'
import * as CacheService from '../../cache'
import * as FavoritingService from '../../services/FavoritingService'
import * as SessionService from '../../services/SessionService'
import * as TwilioService from '../../services/TwilioService'
import config from '../../config'
import Case from 'case'
import startsWithVowel from '../../utils/starts-with-vowel'

// TODO: What else?
const HIGH_LEVEL_SUBJECTS = new Set<SUBJECTS>([
  SUBJECTS.CALCULUS_AB,
  SUBJECTS.CALCULUS_BC,
  SUBJECTS.CHEMISTRY,
  SUBJECTS.STATISTICS,
  SUBJECTS.PHYSICS_ONE,
  SUBJECTS.PHYSICS_TWO,
])

type TextVolunteersJobData = {
  sessionId: string
  subject: string
  subjectDisplayName: string
  topic: string
  studentId: string
  schoolId?: string
  studentPartnerOrg?: string
}
type TextableVolunteer = {
  userId: Ulid
  phoneNumber: string
  firstName: string
  unlockedSubjects: SUBJECTS[]
  mutedSubjects: SUBJECTS[]
  volunteerPartnerOrgKey?: string
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

  const isHighLevelSubject = HIGH_LEVEL_SUBJECTS.has(subject)
  const eligibleTutors = allTextableVolunteers.filter((c) => {
    const canTutorInSubject = c.unlockedSubjects.includes(subject)
    const hasMutedSubject = c.mutedSubjects.includes(subject)
    if (!canTutorInSubject || hasMutedSubject) return false
    if (canTutorInSubject && isHighLevelSubject) return true

    const canTutorHighLevelSubjects = c.unlockedSubjects.some((s) =>
      HIGH_LEVEL_SUBJECTS.has(s)
    )
    return !canTutorHighLevelSubjects
  })

  const associatedPartner = await AssociatedPartnerService.getAssociatedPartner(
    studentPartnerOrg,
    schoolId
  )
  const eligiblePartnerTutors = associatedPartner
    ? eligibleTutors.filter((c) => {
        return (
          c.volunteerPartnerOrgKey === associatedPartner.volunteerPartnerOrg
        )
      })
    : undefined

  const eligibleFavoritedTutors = await filterFavoritedCandidates(
    eligibleTutors,
    studentId
  )

  const selectedTutors = await selectVolunteersByPriority(
    subject,
    eligibleFavoritedTutors,
    eligiblePartnerTutors ?? [],
    eligibleTutors
  )

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
    {
      studentOrgDisplay: associatedPartner?.studentOrgDisplay,
      studentId,
    }
  )
}

async function getTextableVolunteers(): Promise<TextableVolunteer[]> {
  // TODO: Add cache key.
  const candidates = await CacheService.getIfExists('textcandidates')
  if (candidates) return JSON.parse(candidates)
  // TODO: Else, Get from database, set in cache, then return candidates.
  return []
}

async function filterFavoritedCandidates(
  volunteers: TextableVolunteer[],
  studentId: Ulid
): Promise<TextableVolunteer[]> {
  if (!volunteers.length) return []

  const favoritedIds = await FavoritingService.getFavoritedVolunteerIdsFromList(
    studentId,
    volunteers
  )
  return volunteers.filter((v) => favoritedIds.has(v.userId))
}

const subjectToNumberOfTexts: Partial<Record<SUBJECTS, number>> = {
  // TODO: Figure out the actual numbers and add more.
  [SUBJECTS.CALCULUS_AB]: 3,
}
async function selectVolunteersByPriority(
  subject: SUBJECTS,
  ...priorityGroupsInOrder: TextableVolunteer[][]
): Promise<TextableVolunteer[]> {
  const n = subjectToNumberOfTexts[subject] ?? 2
  const volunteersInSessions = await SessionService.getVolunteersInSessions()

  const filteredPriorityGroups = priorityGroupsInOrder.map((group) =>
    group.filter((v) => !volunteersInSessions.has(v.userId))
  )

  const toText: TextableVolunteer[] = []
  for (const group of filteredPriorityGroups) {
    if (toText.length >= n) break
    if (group.length > 0) {
      toText.push(...sampleSize(group, n - toText.length))
    }
  }
  return toText
}

type SessionForTextMessage = {
  sessionId: Uuid
  subject: string
  topic: string
  subjectDisplayName: string
}
type StudentForTextMessage = {
  studentId: Ulid
  studentOrgDisplay?: string
}
async function sendTextMessages(
  volunteers: TextableVolunteer[],
  session: SessionForTextMessage,
  student: StudentForTextMessage
) {
  await Promise.all(
    volunteers.map((v) => {
      const content = buildContent(v.firstName)
      return TwilioService.sendTextMessage(v.phoneNumber, content)
    })
  )

  function buildContent(volunteerFirstName: string) {
    let studentDescription: string = 'a student'
    if (student.studentOrgDisplay) {
      const article = startsWithVowel(student.studentOrgDisplay) ? 'an' : 'a'
      studentDescription = `${article} ${student.studentOrgDisplay} student`
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
