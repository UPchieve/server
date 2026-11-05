import moment from 'moment'
import 'moment-timezone'
import {
  NTHS_CAMPAIGN_EMAILS,
  NTHSCampaignEmail,
} from '../../../constants/nths-campaign'

export { NTHS_CAMPAIGN_EMAILS, NTHSCampaignEmail }

const CAMPAIGN_TIME_ZONE = 'America/New_York'
const INITIAL_LAUNCH_DAY = 21
const EXTENDED_LAUNCH_DAY = 60

export type NTHSCampaignState = {
  approvedAt: Date
  chapterId?: string
  membersCount: number
  sentAt: Partial<Record<NTHSCampaignEmail, Date>>
}

export type NTHSCampaignSelection = {
  email: NTHSCampaignEmail
  campaignDay: number
  launchDate: Date
  daysLeft: number
}

type Candidate = {
  email: NTHSCampaignEmail
  priority: number
}

function startOfCampaignDay(value: Date): moment.Moment {
  return moment(value).tz(CAMPAIGN_TIME_ZONE).startOf('day')
}

function hasSentAny(
  sentAt: NTHSCampaignState['sentAt'],
  emails: NTHSCampaignEmail[]
): boolean {
  return emails.some((email) => sentAt[email] != null)
}

export function selectNTHSCampaignEmail(
  state: NTHSCampaignState,
  now: Date
): NTHSCampaignSelection | undefined {
  const approvalDay = startOfCampaignDay(state.approvedAt)
  const today = startOfCampaignDay(now)
  const campaignDay = today.diff(approvalDay, 'days')
  if (campaignDay < 0) return
  if (
    Object.values(state.sentAt).some(
      (sentAt) => sentAt && startOfCampaignDay(sentAt).isSame(today)
    )
  )
    return

  const hasChapter = state.chapterId != null
  const activationEmailDripStarted = state.sentAt.activationA1 != null
  const candidates: Candidate[] = []
  const tryAddCandidate = (
    email: NTHSCampaignEmail,
    due: boolean,
    priority: number
  ) => {
    if (due && state.sentAt[email] == null) candidates.push({ email, priority })
  }

  if (
    !activationEmailDripStarted &&
    state.membersCount < 3 &&
    state.sentAt.day21Extension == null
  ) {
    tryAddCandidate(
      'setupDay3',
      !hasChapter &&
        campaignDay >= 3 &&
        !hasSentAny(state.sentAt, [
          'recruitingDay3',
          'recruitingDay8',
          'recruitingDay14',
          'recruitingDay18',
        ]),
      0
    )
    tryAddCandidate(
      'recruitingDay3',
      hasChapter &&
        campaignDay >= 3 &&
        !hasSentAny(state.sentAt, [
          'recruitingDay8',
          'recruitingDay14',
          'recruitingDay18',
        ]),
      1
    )
    tryAddCandidate(
      'recruitingDay8',
      campaignDay >= 8 &&
        !hasSentAny(state.sentAt, ['recruitingDay14', 'recruitingDay18']),
      2
    )
    tryAddCandidate(
      'recruitingDay14',
      campaignDay >= 14 && !hasSentAny(state.sentAt, ['recruitingDay18']),
      3
    )
    tryAddCandidate('recruitingDay18', hasChapter && campaignDay >= 18, 4)
  }

  if (!activationEmailDripStarted) {
    tryAddCandidate(
      'activationA1',
      hasChapter && state.membersCount >= 3 && campaignDay <= 60,
      5
    )
  } else {
    const a1Day = startOfCampaignDay(state.sentAt.activationA1!)
    const daysSinceA1 = today.diff(a1Day, 'days')
    tryAddCandidate(
      'activationA2',
      daysSinceA1 >= 4 && state.sentAt.activationA3 == null,
      6
    )
    tryAddCandidate('activationA3', daysSinceA1 >= 9, 7)
  }

  tryAddCandidate('day21Extension', hasChapter && campaignDay >= 21, 8)

  const selected = candidates.sort(
    (first, second) => second.priority - first.priority
  )[0]
  if (!selected) return

  const launchDay =
    state.sentAt.day21Extension != null || selected.email === 'day21Extension'
      ? EXTENDED_LAUNCH_DAY
      : INITIAL_LAUNCH_DAY
  const launchDate = approvalDay.clone().add(launchDay, 'days')

  return {
    email: selected.email,
    campaignDay,
    launchDate: launchDate.toDate(),
    daysLeft: launchDate.diff(today, 'days'),
  }
}
