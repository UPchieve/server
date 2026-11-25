import type { ISODateString, Uuid } from './shared.js'

export type NTHSHomeLink = {
  title: string
  body: string
  link: string
  forMembers: boolean
}

export type NTHSHomeContent = { tips: string[]; links: NTHSHomeLink[] }

export type NTHSResourceCard = {
  title: string
  body: string
  link: string
  icon: string
}

export type NTHSResourceGroup = {
  title: string
  subtitle: string
  icon: string
  cards: NTHSResourceCard[]
}

export type NTHSResources = { groups: NTHSResourceGroup[] }

export type NTHSSchoolYearPublic = {
  label: string
  startsAt: ISODateString
  endsAt: ISODateString
}

export type NTHSChapterImpactTotalsPublic = {
  studentsHelped: number
  sessionsCompleted: number
  hoursTutored: number
}

// thisWeek, lastTwoWeeks and thisMonth run from the start the browser sent (or
// its UTC equivalent) to the moment of the request.
export type NTHSPeriodHoursPublic = {
  thisWeek: number
  lastTwoWeeks: number
  thisMonth: number
  thisSchoolYear: number
  allTime: number
}

export type NTHSPeriodSessionsPublic = NTHSPeriodHoursPublic

export type NTHSChapterImpactPublic = {
  groupId: Uuid
  schoolYear: NTHSSchoolYearPublic
  schoolYearToDate: NTHSChapterImpactTotalsPublic & { membersTutoring: number }
  allTime: NTHSChapterImpactTotalsPublic
  goals: {
    hoursTutored: number
    membersTutoring: number
  }
  official: boolean
}

export type NTHSChapterImpactResponse = {
  impact: NTHSChapterImpactPublic
}

export type NTHSChapterRosterMemberPublic = {
  userId: Uuid
  firstName: string
  lastInitial: string
  roleName: 'admin' | 'member'
  title: 'President' | 'Vice President' | 'Executive Board Member' | 'Member'
  joinedAt: ISODateString
  trainingComplete: boolean
  safetyApproved: boolean
  accountClosed: boolean
  periodHours: NTHSPeriodHoursPublic
  periodSessions: NTHSPeriodSessionsPublic
  // Zero unless an admin's request names a range.
  rangeHours: number
  rangeSessions: number
  // The member's most recent counted session, with no school-year bound, so it
  // can predate the current school year.
  lastActiveAt?: ISODateString
  studentsHelpedThisYear: number
  // Display names of the active subjects the member can tutor, alphabetical.
  subjects: string[]
}

export type NTHSChapterRosterPublic = {
  groupId: Uuid
  schoolYear: NTHSSchoolYearPublic
  members: NTHSChapterRosterMemberPublic[]
}

export type NTHSChapterRosterResponse = {
  roster: NTHSChapterRosterPublic
}
