import { schoolYearFor } from '../utils/school-year'
import type { NTHSRenewalCandidacy } from '../models/NTHSRenewal'
import type { NTHSRenewalDates } from './NTHSRenewalDatesService'

export type NTHSRenewalPrompt =
  | 'none'
  | 'co-president-offer'
  | 'successor-must-answer'
  | 'successor-not-cleared'
  | 'decliner-countdown'
  | 'member-must-answer'
  | 'member-not-cleared'
  | 'successors-named'
  | 'name-successor-reminder'
  | 'name-successor-banner'

export type RenewalPromptInput = {
  dates: NTHSRenewalDates | null
  now: Date
  chapter: {
    createdAt: Date
    closedAt: Date | null
    hasConfirmedPresident: boolean
    hasNamedSuccessor: boolean
  }
  viewer: {
    isAdmin: boolean
    isCleared: boolean
    isBanned: boolean
    candidacy: NTHSRenewalCandidacy
  }
}

export type NTHSRenewalCycle = {
  year: number
  nominationsOpenAt: Date
  adminReminderAt: Date
  successorConfirmationAt: Date
  memberStageAt: Date
  closesAt: Date
  schoolYearStartsOn: Date
  closesOn: string
}

function openingInstant(year: number, monthDay: string, addDays = 0): Date {
  const [month, day] = monthDay.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + addDays, 12))
}

function cycleFor(dates: NTHSRenewalDates, year: number): NTHSRenewalCycle {
  return {
    year,
    nominationsOpenAt: openingInstant(year, dates.nominationsOpen),
    adminReminderAt: openingInstant(year, dates.adminReminder),
    successorConfirmationAt: openingInstant(year, dates.successorConfirmation),
    memberStageAt: openingInstant(year, dates.memberStage),
    closesAt: openingInstant(year, dates.closeDate, 1),
    schoolYearStartsOn: schoolYearFor(new Date(Date.UTC(year, 6, 1))).startsAt,
    closesOn: `${year}-${dates.closeDate}`,
  }
}

export function nextRenewalCycle(
  dates: NTHSRenewalDates,
  now: Date
): NTHSRenewalCycle {
  const year = now.getUTCFullYear()
  for (const candidate of [year - 1, year]) {
    const cycle = cycleFor(dates, candidate)
    if (cycle.closesAt > now) return cycle
  }
  return cycleFor(dates, year + 1)
}

function renewingCycle(input: RenewalPromptInput): NTHSRenewalCycle | null {
  const { dates, now, chapter } = input
  if (!dates || chapter.closedAt) return null
  const cycle = nextRenewalCycle(dates, now)
  return chapter.createdAt < cycle.schoolYearStartsOn ? cycle : null
}

function promptFor(
  input: RenewalPromptInput,
  cycle: NTHSRenewalCycle
): NTHSRenewalPrompt {
  const { now, chapter, viewer } = input
  const { candidacy, isCleared } = viewer
  const fromSuccessorDate = now >= cycle.successorConfirmationAt
  const fromMemberStage = now >= cycle.memberStageAt
  const nominationsOpen = now >= cycle.nominationsOpenAt && !fromMemberStage
  const clearedAdmin = viewer.isAdmin && isCleared

  if (chapter.hasConfirmedPresident) {
    return candidacy === 'named' && isCleared && fromSuccessorDate
      ? 'co-president-offer'
      : 'none'
  }
  if (candidacy === 'named' && fromSuccessorDate) {
    return isCleared ? 'successor-must-answer' : 'successor-not-cleared'
  }
  if (fromMemberStage) {
    if (!isCleared && (candidacy === 'none' || candidacy === 'declined')) {
      return 'member-not-cleared'
    }
    if (candidacy === 'declined') return 'decliner-countdown'
    if (candidacy === 'none') return 'member-must-answer'
  }
  if (clearedAdmin && nominationsOpen) {
    if (chapter.hasNamedSuccessor) return 'successors-named'
    return now >= cycle.adminReminderAt
      ? 'name-successor-reminder'
      : 'name-successor-banner'
  }
  return 'none'
}

export function renewalPromptFor(input: RenewalPromptInput): {
  prompt: NTHSRenewalPrompt
  closesOn: string | null
} {
  const cycle = renewingCycle(input)
  if (!cycle || input.viewer.isBanned) return { prompt: 'none', closesOn: null }
  return { prompt: promptFor(input, cycle), closesOn: cycle.closesOn }
}

export function renewalControlsFor(input: RenewalPromptInput): {
  canNameSelf: boolean
  namingSelfAccepts: boolean
} {
  const cycle = renewingCycle(input)
  const { now, chapter, viewer } = input
  if (!cycle || viewer.isBanned) {
    return { canNameSelf: false, namingSelfAccepts: false }
  }
  return {
    canNameSelf:
      viewer.isAdmin &&
      viewer.isCleared &&
      viewer.candidacy === 'none' &&
      !chapter.hasConfirmedPresident &&
      now >= cycle.nominationsOpenAt &&
      now < cycle.memberStageAt,
    namingSelfAccepts: now >= cycle.successorConfirmationAt,
  }
}
