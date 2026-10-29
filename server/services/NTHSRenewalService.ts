import type { NTHSRenewalPublic } from '../contracts/nths-group'
import { schoolYearFor } from '../utils/school-year'
import type { NTHSTitle } from '../constants/nths-titles'
import type { Ulid } from '../models/pgUtils'
import { CaughtError } from '../models/Errors'
import type { NTHSGroupWithMemberInfo } from '../models/NTHSGroups'
import * as NTHSRenewalRepo from '../models/NTHSRenewal'
import type {
  NTHSRenewalCandidacy,
  NTHSRenewalState,
  NTHSRenewalSuccessor,
} from '../models/NTHSRenewal'
import { getUsersBanStatuses } from '../models/User'
import {
  getNthsChapterRenewalDates,
  type NTHSRenewalDates,
} from './NTHSRenewalDatesService'
import { getChapterMemberClearance } from './NTHSGroupsService'
import { isNthsChapterRenewalEnabled } from './FeatureFlagService'

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

const PRESIDENT: NTHSTitle = 'President'

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

function isChapterRenewing(
  chapter: { createdAt: Date; closedAt: Date | null },
  cycle: NTHSRenewalCycle
): boolean {
  return !chapter.closedAt && chapter.createdAt < cycle.schoolYearStartsOn
}

function renewingCycle(input: RenewalPromptInput): NTHSRenewalCycle | null {
  const { dates, now, chapter } = input
  if (!dates) return null
  const cycle = nextRenewalCycle(dates, now)
  return isChapterRenewing(chapter, cycle) ? cycle : null
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

function offRenewal(group: NTHSGroupWithMemberInfo): NTHSRenewalPublic {
  return {
    prompt: 'none',
    closesOn: null,
    commitmentsRequired: group.memberInfo.title !== PRESIDENT,
    canNameSelf: false,
    namingSelfAccepts: false,
  }
}

async function getRenewalDates(userId: Ulid): Promise<NTHSRenewalDates | null> {
  if (!(await isNthsChapterRenewalEnabled(userId))) return null
  return await getNthsChapterRenewalDates()
}

export async function getRenewalsForViewer(
  userId: Ulid,
  groups: NTHSGroupWithMemberInfo[],
  now: Date
): Promise<NTHSRenewalPublic[]> {
  if (!(await isNthsChapterRenewalEnabled(userId)))
    return groups.map(offRenewal)
  const dates = await getNthsChapterRenewalDates()
  if (!dates) return groups.map(offRenewal)

  const { schoolYearStartsOn } = nextRenewalCycle(dates, now)
  const { isClearedAsAdmin, isClearedAsMember, isBanned } =
    await getChapterMemberClearance(userId)
  const renewals: NTHSRenewalPublic[] = []
  for (const group of groups) {
    const state = await NTHSRenewalRepo.getNthsRenewalState(
      group.groupInfo.id,
      userId,
      schoolYearStartsOn.toISOString().slice(0, 10)
    )
    if (!state) {
      renewals.push(offRenewal(group))
      continue
    }
    const isAdmin = group.memberInfo.roleName === 'admin'
    const input: RenewalPromptInput = {
      dates,
      now,
      chapter: state,
      viewer: {
        isAdmin,
        isCleared: isAdmin ? isClearedAsAdmin : isClearedAsMember,
        isBanned,
        candidacy: state.viewerCandidacy,
      },
    }
    renewals.push({
      ...offRenewal(group),
      ...renewalPromptFor(input),
      ...renewalControlsFor(input),
    })
  }
  return renewals
}

// Generic on purpose: naming the reason would tell a shadow-banned member they
// are banned.
export class NTHSRenewalNotEligibleError extends CaughtError {
  readonly httpStatus = 403
  readonly defaultClientMessage =
    'You are not currently eligible to take part in chapter renewal'
}

export class NTHSRenewalNotOpenError extends CaughtError {
  readonly httpStatus = 422
  readonly defaultClientMessage = 'Chapter renewal is not open right now'
}

type OpenRenewal = { dates: NTHSRenewalDates; cycle: NTHSRenewalCycle }

function schoolYearDate(cycle: NTHSRenewalCycle): string {
  return cycle.schoolYearStartsOn.toISOString().slice(0, 10)
}

async function getOpenRenewal(userId: Ulid, now: Date): Promise<OpenRenewal> {
  const dates = await getRenewalDates(userId)
  if (!dates) {
    throw new NTHSRenewalNotOpenError({
      message: 'NTHS chapter renewal is off',
      context: { userId },
    })
  }
  return { dates, cycle: nextRenewalCycle(dates, now) }
}

function isRenewing(
  state: NTHSRenewalState | undefined,
  cycle: NTHSRenewalCycle
): state is NTHSRenewalState {
  return !!state && isChapterRenewing(state, cycle)
}

function isNamingOpen(cycle: NTHSRenewalCycle, now: Date): boolean {
  return now >= cycle.nominationsOpenAt && now < cycle.memberStageAt
}

function notEligible(userId: Ulid, groupId: Ulid) {
  return new NTHSRenewalNotEligibleError({
    message: 'Member is not eligible for NTHS renewal',
    context: { userId, groupId },
  })
}

async function ensureNotBanned(userId: Ulid, groupId: Ulid) {
  const [banStatus] = await getUsersBanStatuses([userId])
  if (banStatus?.banType) {
    throw notEligible(userId, groupId)
  }
}

export async function getRenewalSuccessors(
  userId: Ulid,
  groupId: Ulid,
  now: Date
): Promise<{ successors: NTHSRenewalSuccessor[]; canEditSuccessors: boolean }> {
  const { cycle } = await getOpenRenewal(userId, now)
  await ensureNotBanned(userId, groupId)
  const schoolYearStartsOn = schoolYearDate(cycle)
  const state = await NTHSRenewalRepo.getNthsRenewalState(
    groupId,
    userId,
    schoolYearStartsOn
  )
  const successors = await NTHSRenewalRepo.getRenewalSuccessors(
    groupId,
    schoolYearStartsOn
  )
  return {
    successors,
    canEditSuccessors:
      isRenewing(state, cycle) &&
      !state.hasConfirmedPresident &&
      isNamingOpen(cycle, now) &&
      !mustAnswerFirst(state, cycle, now),
  }
}

function mustAnswerFirst(
  state: NTHSRenewalState,
  cycle: NTHSRenewalCycle,
  now: Date
) {
  return (
    state.viewerCandidacy === 'named' && now >= cycle.successorConfirmationAt
  )
}
