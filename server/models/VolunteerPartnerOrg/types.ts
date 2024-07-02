export type VolunteerPartnerOrgForRegistration = {
  key: string
  domains?: string[]
}

export type VolunteerPartnerOrg = {
  domains?: string[]
  key: string
  name: string
  receiveWeeklyHourSummaryEmail: boolean
  deactivated?: boolean
}
