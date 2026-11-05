import type { NTHSRenewalPublic } from '../contracts/nths-group'
import { schoolYearFor } from '../utils/school-year'
import type { NTHSTitle } from '../constants/nths-titles'
import type { Ulid } from '../models/pgUtils'
import { getClient, runInTransaction, TransactionClient } from '../db'
import { CaughtError } from '../models/Errors'
import * as NTHSGroupsRepo from '../models/NTHSGroups'
import type {
  NTHSActiveGroupMember,
  NTHSGroupWithMemberInfo,
} from '../models/NTHSGroups'
import * as NTHSRenewalRepo from '../models/NTHSRenewal'
import type { NTHSRenewalState } from '../models/NTHSRenewal'
import {
  getNthsChapterRenewalDates,
  type NTHSRenewalDates,
} from './NTHSRenewalDatesService'
import {
  closeGroupAndRelease,
  getChapterMemberClearance,
  getChapterClearanceGaps,
  syncChangedMembers,
} from './NTHSGroupsService'
import { COMMITMENTS } from './NTHSApplicationService'
import { isNthsChapterRenewalEnabled } from './FeatureFlagService'
import { daysInMs, hoursInMs } from '../utils/time-utils'

export type NTHSRenewalPrompt =
  | 'none'
  | 'handoff-banner'
  | 'confirm-return'
  | 'confirm-reminder'
  | 'president-not-cleared'
  | 'member-not-cleared'
  | 'member-countdown'
  | 'step-up'

export type RenewalPromptInput = {
  dates: NTHSRenewalDates | null
  now: Date
  chapter: {
    createdAt: Date
    closedAt: Date | null
    hasConfirmedPresident: boolean
    hasManager: boolean
  }
  viewer: {
    isAdmin: boolean
    isPresident: boolean
    isCleared: boolean
  }
}

const PRESIDENT: NTHSTitle = 'President'

export type NTHSRenewalCycle = {
  year: number
  nominationsOpenAt: Date
  successorConfirmationAt: Date
  memberStageAt: Date
  memberEmailEndsAt: Date
  closesAt: Date
  closeWindowEndsAt: Date
  schoolYearStartsOn: Date
  closesOn: string
  sentSince: Date
  successorConfirmationOn: string
}

function openingInstant(year: number, monthDay: string, addDays = 0): Date {
  const [month, day] = monthDay.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + addDays, 12))
}

function cycleFor(dates: NTHSRenewalDates, year: number): NTHSRenewalCycle {
  const closesAt = openingInstant(year, dates.closeDate, 1)
  return {
    year,
    nominationsOpenAt: openingInstant(year, dates.nominationsOpen),
    successorConfirmationAt: openingInstant(year, dates.successorConfirmation),
    memberStageAt: openingInstant(year, dates.memberStage),
    // The close date ends at UTC-11, the last US time zone, so the member-stage email stops then.
    memberEmailEndsAt: new Date(closesAt.getTime() - hoursInMs(1)),
    closesAt,
    closeWindowEndsAt: new Date(closesAt.getTime() + daysInMs(1)),
    schoolYearStartsOn: schoolYearFor(new Date(Date.UTC(year, 6, 1))).startsAt,
    closesOn: `${year}-${dates.closeDate}`,
    sentSince: new Date(Date.UTC(year, 0, 1)),
    successorConfirmationOn: `${year}-${dates.successorConfirmation}`,
  }
}

function recentCycles(dates: NTHSRenewalDates, now: Date): NTHSRenewalCycle[] {
  const year = now.getUTCFullYear()
  return [year - 1, year].map((candidate) => cycleFor(dates, candidate))
}

export function nextRenewalCycle(
  dates: NTHSRenewalDates,
  now: Date
): NTHSRenewalCycle {
  return (
    recentCycles(dates, now).find(({ closesAt }) => closesAt > now) ??
    cycleFor(dates, now.getUTCFullYear() + 1)
  )
}

export function closeRenewalCycle(
  dates: NTHSRenewalDates,
  now: Date
): NTHSRenewalCycle | undefined {
  return recentCycles(dates, now).find(
    ({ closesAt, closeWindowEndsAt }) =>
      closesAt <= now && now < closeWindowEndsAt
  )
}

function isChapterRenewing(
  chapter: { createdAt: Date; closedAt: Date | null },
  cycle: NTHSRenewalCycle
): boolean {
  return !chapter.closedAt && chapter.createdAt < cycle.schoolYearStartsOn
}

// For a day after a close instant the closing cycle decides, so a chapter due
// to close can't be taken over before the close run.
function stepUpCycle(dates: NTHSRenewalDates, now: Date): NTHSRenewalCycle {
  return closeRenewalCycle(dates, now) ?? nextRenewalCycle(dates, now)
}

function unconfirmedSince(
  state: NTHSRenewalState,
  cycle: NTHSRenewalCycle,
  since: Date,
  now: Date
): boolean {
  return (
    isChapterRenewing(state, cycle) &&
    !state.hasConfirmedPresident &&
    now >= since
  )
}

function renewingCycle(input: RenewalPromptInput): NTHSRenewalCycle | null {
  const { dates, now, chapter } = input
  if (!dates) return null
  const cycle = nextRenewalCycle(dates, now)
  return isChapterRenewing(chapter, cycle) ? cycle : null
}

export type RenewalStage =
  | 'before'
  | 'handoff'
  | 'confirm'
  | 'member'
  | 'confirmed'

// The cycle comes from nextRenewalCycle, so now is before its close instant.
export function renewalStage(
  chapter: Pick<NTHSRenewalState, 'hasConfirmedPresident' | 'hasManager'>,
  cycle: NTHSRenewalCycle,
  now: Date
): RenewalStage {
  if (now < cycle.nominationsOpenAt) return 'before'
  if (now < cycle.successorConfirmationAt) return 'handoff'
  if (chapter.hasConfirmedPresident) return 'confirmed'
  return now >= cycle.memberStageAt || !chapter.hasManager
    ? 'member'
    : 'confirm'
}

function promptFor(
  input: RenewalPromptInput,
  cycle: NTHSRenewalCycle
): NTHSRenewalPrompt {
  const { now, chapter, viewer } = input
  const { isCleared } = viewer
  switch (renewalStage(chapter, cycle, now)) {
    case 'handoff':
      return viewer.isAdmin && isCleared ? 'handoff-banner' : 'none'
    case 'confirm':
      if (viewer.isPresident) {
        return isCleared ? 'confirm-return' : 'president-not-cleared'
      }
      return viewer.isAdmin && isCleared ? 'confirm-reminder' : 'none'
    case 'member':
      return isCleared ? 'member-countdown' : 'member-not-cleared'
    default:
      return 'none'
  }
}

const NO_RENEWAL: NTHSRenewalPublic = {
  prompt: 'none',
  closesOn: null,
  successorConfirmationOn: null,
}

export function renewalPromptFor(input: RenewalPromptInput): NTHSRenewalPublic {
  const cycle = renewingCycle(input)
  if (!cycle) return NO_RENEWAL
  return {
    prompt: promptFor(input, cycle),
    closesOn: cycle.closesOn,
    successorConfirmationOn: cycle.successorConfirmationOn,
  }
}

type ViewerMembership = Pick<
  NTHSActiveGroupMember,
  'nthsGroupId' | 'title' | 'roleName'
>

async function getRenewalDates(userId: Ulid): Promise<NTHSRenewalDates | null> {
  if (!(await isNthsChapterRenewalEnabled(userId))) return null
  return await getNthsChapterRenewalDates()
}

export async function getRenewalsForViewer(
  userId: Ulid,
  groups: NTHSGroupWithMemberInfo[],
  now: Date
): Promise<NTHSRenewalPublic[]> {
  const memberships = groups.map(({ groupInfo, memberInfo }) => ({
    nthsGroupId: groupInfo.id,
    title: memberInfo.title,
    roleName: memberInfo.roleName,
  }))
  // Step-up reads the dates whatever the viewer's renewal flag says.
  const dates = await getNthsChapterRenewalDates()
  if (!dates) return memberships.map(() => NO_RENEWAL)
  const renewalOn = !!(await isNthsChapterRenewalEnabled(userId))
  return await renewalsWithDates(userId, memberships, dates, renewalOn, now)
}

async function offersStepUp(
  userId: Ulid,
  groupId: Ulid,
  state: NTHSRenewalState,
  dates: NTHSRenewalDates,
  now: Date
): Promise<boolean> {
  if (state.hasManager) return false
  const closing = closeRenewalCycle(dates, now)
  if (!closing) return true
  const closingState = await NTHSRenewalRepo.getNthsRenewalState(
    groupId,
    userId,
    schoolYearDate(closing)
  )
  return (
    !!closingState &&
    !unconfirmedSince(closingState, closing, closing.closesAt, now)
  )
}

async function renewalsWithDates(
  userId: Ulid,
  memberships: ViewerMembership[],
  dates: NTHSRenewalDates,
  renewalOn: boolean,
  now: Date
): Promise<NTHSRenewalPublic[]> {
  const schoolYearStartsOn = schoolYearDate(nextRenewalCycle(dates, now))
  const renewals: NTHSRenewalPublic[] = []
  for (const membership of memberships) {
    const state = await NTHSRenewalRepo.getNthsRenewalState(
      membership.nthsGroupId,
      userId,
      schoolYearStartsOn
    )
    if (!state) {
      renewals.push(NO_RENEWAL)
      continue
    }
    // With the flag off a viewer can only be offered step-up, which a managed
    // chapter never offers.
    if (!renewalOn && state.hasManager) {
      renewals.push(NO_RENEWAL)
      continue
    }
    const { isClearedAsAdmin, isClearedAsMember } =
      await getChapterMemberClearance(userId)
    const isAdmin = membership.roleName === 'admin'
    const isCleared = isAdmin ? isClearedAsAdmin : isClearedAsMember
    const renewal = renewalOn
      ? renewalPromptFor({
          dates,
          now,
          chapter: state,
          viewer: {
            isAdmin,
            isPresident: membership.title === PRESIDENT,
            isCleared,
          },
        })
      : NO_RENEWAL
    if (
      renewal.prompt === 'none' &&
      isCleared &&
      (await offersStepUp(userId, membership.nthsGroupId, state, dates, now))
    ) {
      renewals.push({ ...renewal, prompt: 'step-up' })
      continue
    }
    renewals.push(renewal)
  }
  return renewals
}

export class NTHSRenewalNotEligibleError extends CaughtError {
  readonly httpStatus = 403
  readonly defaultClientMessage =
    'You are not currently eligible to take part in chapter renewal'
}

export class NTHSRenewalNotClearedError extends CaughtError {
  readonly httpStatus = 403
  readonly defaultClientMessage =
    'To accept the presidency, add high school student to your occupations and finish onboarding and approval'
}

export class NTHSRenewalNotOpenError extends CaughtError {
  readonly httpStatus = 422
  readonly defaultClientMessage = 'Chapter renewal is not open right now'
}

export class NTHSRenewalCommitmentsRequiredError extends CaughtError {
  readonly httpStatus = 400
  readonly defaultClientMessage =
    'Agree to every commitment to accept the presidency'
  readonly code = 'commitments_required'
}

export type NTHSAcceptanceReason = 'renewal' | 'step-up'
export type RenewalCommitments = Record<string, boolean>
export type NTHSAcceptanceOutcome = 'accepted' | 'has_president'

type OpenRenewal = { dates: NTHSRenewalDates; cycle: NTHSRenewalCycle }

export function schoolYearDate(cycle: NTHSRenewalCycle): string {
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

async function lockRenewingChapter(
  userId: Ulid,
  groupId: Ulid,
  cycle: NTHSRenewalCycle,
  tc: TransactionClient
): Promise<NTHSRenewalState> {
  await NTHSGroupsRepo.lockGroupForMemberChange(groupId, tc)
  const state = await NTHSRenewalRepo.getNthsRenewalState(
    groupId,
    userId,
    schoolYearDate(cycle),
    tc
  )
  if (!isRenewing(state, cycle)) {
    throw new NTHSRenewalNotOpenError({
      message: 'NTHS chapter is not renewing',
      context: { userId, groupId },
    })
  }
  return state
}

function ensureConfirmationOpen(stage: RenewalStage) {
  if (stage === 'before' || stage === 'handoff') {
    throw new NTHSRenewalNotOpenError({
      message: 'NTHS renewal answers are not open yet',
      context: { stage },
    })
  }
}

function notEligible(userId: Ulid, groupId: Ulid) {
  return new NTHSRenewalNotEligibleError({
    message: 'Member is not eligible for NTHS renewal',
    context: { userId, groupId },
  })
}

async function ensureEligibleMember(
  userId: Ulid,
  groupId: Ulid,
  tc: TransactionClient
): Promise<NTHSActiveGroupMember> {
  const member = await NTHSGroupsRepo.getActiveNthsGroupMember(
    userId,
    groupId,
    tc
  )
  if (!member) {
    throw notEligible(userId, groupId)
  }
  return member
}

async function ensureCleared(
  userId: Ulid,
  member: NTHSActiveGroupMember,
  tc: TransactionClient
) {
  const isAdmin = member.roleName === 'admin'
  const { needsOccupation, needsOnboarding } = await getChapterClearanceGaps(
    userId,
    isAdmin,
    tc
  )
  if (!needsOccupation && !needsOnboarding) {
    return
  }
  const missing = []
  if (needsOccupation) {
    missing.push('add high school student to your occupations')
  }
  if (needsOnboarding) {
    missing.push('finish onboarding and approval')
  }
  throw new NTHSRenewalNotClearedError({
    message: 'Member is not cleared to accept the NTHS presidency',
    clientMessage: `To accept the presidency, ${missing.join(' and ')}`,
    context: { userId, isAdmin },
  })
}

function agreedCommitments(
  commitments: RenewalCommitments | undefined
): Record<string, true> {
  if (!COMMITMENTS.every(({ key }) => commitments?.[key] === true)) {
    throw new NTHSRenewalCommitmentsRequiredError({
      message: 'NTHS presidency accepted without every commitment',
    })
  }
  return Object.fromEntries(COMMITMENTS.map(({ key }) => [key, true]))
}

// Step-up before confirmation opens takes the presidency without confirming
// the chapter for renewal, so it records no answer.
async function writeAcceptance(
  member: NTHSActiveGroupMember,
  schoolYearStartsOn: string,
  commitments: Record<string, true>,
  recordAnswer: boolean,
  tc: TransactionClient
): Promise<Ulid[]> {
  const { userId, nthsGroupId } = member
  if (recordAnswer) {
    await NTHSRenewalRepo.upsertRenewalAnswer(
      {
        groupId: nthsGroupId,
        schoolYearStartsOn,
        userId,
        commitments,
      },
      tc
    )
  }
  if (member.roleName === 'admin' && member.title === PRESIDENT) return []
  await NTHSGroupsRepo.upsertNthsGroupMemberRole(
    { userId, nthsGroupId, roleName: 'admin' },
    tc
  )
  await NTHSGroupsRepo.updateNthsGroupMemberTitle(
    { userId, nthsGroupId, title: PRESIDENT },
    tc
  )
  return [userId]
}

async function renewalAfterWrite(
  userId: Ulid,
  groupId: Ulid,
  dates: NTHSRenewalDates,
  renewalOn: boolean,
  now: Date
): Promise<NTHSRenewalPublic> {
  const membership = await NTHSGroupsRepo.getActiveNthsGroupMember(
    userId,
    groupId,
    getClient()
  )
  if (!membership) return NO_RENEWAL
  const [renewal] = await renewalsWithDates(
    userId,
    [membership],
    dates,
    renewalOn,
    now
  )
  return renewal
}

export async function acceptPresidency(
  userId: Ulid,
  groupId: Ulid,
  acceptance: {
    reason: NTHSAcceptanceReason
    commitments?: RenewalCommitments
  },
  now: Date
): Promise<{ renewal: NTHSRenewalPublic; outcome: NTHSAcceptanceOutcome }> {
  if (acceptance.reason === 'step-up') {
    return await stepUp(userId, groupId, acceptance.commitments, now)
  }
  const { dates, cycle } = await getOpenRenewal(userId, now)
  const { outcome, changedUserIds } = await runInTransaction(async (tc) => {
    const state = await lockRenewingChapter(userId, groupId, cycle, tc)
    const stage = renewalStage(state, cycle, now)
    ensureConfirmationOpen(stage)
    const member = await ensureEligibleMember(userId, groupId, tc)
    if (state.viewerCandidacy === 'accepted') {
      return { outcome: 'accepted' as const, changedUserIds: [] }
    }
    if (stage === 'confirmed') {
      return { outcome: 'has_president' as const, changedUserIds: [] }
    }
    if (stage === 'confirm' && member.title !== PRESIDENT) {
      throw new NTHSRenewalNotOpenError({
        message: 'Only a President confirms before the member stage',
        clientMessage:
          'Only a member with the President title can confirm the chapter right now.',
        context: { userId, groupId },
      })
    }
    await ensureCleared(userId, member, tc)
    const commitments = agreedCommitments(acceptance.commitments)
    return {
      outcome: 'accepted' as const,
      changedUserIds: await writeAcceptance(
        member,
        schoolYearDate(cycle),
        commitments,
        true,
        tc
      ),
    }
  })
  await syncChangedMembers(changedUserIds)
  return {
    renewal: await renewalAfterWrite(userId, groupId, dates, true, now),
    outcome,
  }
}

async function stepUp(
  userId: Ulid,
  groupId: Ulid,
  commitments: RenewalCommitments | undefined,
  now: Date
): Promise<{ renewal: NTHSRenewalPublic; outcome: NTHSAcceptanceOutcome }> {
  const dates = await getNthsChapterRenewalDates()
  if (!dates) {
    throw new NTHSRenewalNotOpenError({
      message: 'NTHS renewal dates are unreadable, so step-up is off',
      clientMessage:
        'Something went wrong. Please refresh the page and try again.',
      context: { userId, groupId },
    })
  }
  const cycle = stepUpCycle(dates, now)
  const schoolYearStartsOn = schoolYearDate(cycle)
  const { outcome, changedUserIds } = await runInTransaction(async (tc) => {
    await NTHSGroupsRepo.lockGroupForMemberChange(groupId, tc)
    const state = await NTHSRenewalRepo.getNthsRenewalState(
      groupId,
      userId,
      schoolYearStartsOn,
      tc
    )
    if (
      !state ||
      state.hasManager ||
      unconfirmedSince(state, cycle, cycle.closesAt, now)
    ) {
      return { outcome: 'has_president' as const, changedUserIds: [] }
    }
    const member = await ensureEligibleMember(userId, groupId, tc)
    await ensureCleared(userId, member, tc)
    return {
      outcome: 'accepted' as const,
      changedUserIds: await writeAcceptance(
        member,
        schoolYearStartsOn,
        agreedCommitments(commitments),
        unconfirmedSince(state, cycle, cycle.successorConfirmationAt, now),
        tc
      ),
    }
  })
  await syncChangedMembers(changedUserIds)
  const renewalOn = !!(await isNthsChapterRenewalEnabled(userId))
  return {
    renewal: await renewalAfterWrite(userId, groupId, dates, renewalOn, now),
    outcome,
  }
}

export async function closeDueChapter(
  groupId: Ulid,
  cycle: NTHSRenewalCycle,
  closedAt: Date
): Promise<boolean> {
  const affectedUserIds = await runInTransaction(async (tc) => {
    await NTHSGroupsRepo.lockGroupForMemberChange(groupId, tc)
    const stillDue = await NTHSRenewalRepo.getChapterDueToRenewalClose(
      groupId,
      schoolYearDate(cycle),
      cycle.closesAt,
      tc
    )
    if (!stillDue) return null
    await closeGroupAndRelease(groupId, closedAt, tc)
    return stillDue.affectedUserIds
  })
  if (!affectedUserIds) return false
  await syncChangedMembers(affectedUserIds)
  return true
}
