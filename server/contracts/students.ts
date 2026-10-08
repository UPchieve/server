import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { TeacherClassForStudentPublic } from './teachers'

export type PastVolunteerPublic = {
  volunteerId: Uuid
  firstName: string
  numSessions: number
  isFavorite: boolean
}

export type PastVolunteersResponse = {
  pastVolunteers: PastVolunteerPublic[]
}

export type StudentPartnerOrgInstancePublic = {
  name: string
  id: Uuid
  schoolId?: Uuid
  siteName?: string
}

export type StudentUserProfilePublic = {
  id: Uuid
  userId: Uuid
  email: string
  firstName: string
  lastName: string
  gradeLevel?: string
  schoolId?: Uuid
  createdAt: ISODateString
}

export type RemainingFavoriteAmountResponse = {
  remaining: number
}

export type IsFavoriteVolunteerResponse = {
  isFavorite: boolean
}

export type FavoriteLimitReachedResponse = {
  success: false
  message: string
}

export type ActivePartnerOrgsResponse = {
  activePartners: StudentPartnerOrgInstancePublic[]
}

export type ActiveStudentClassesResponse = {
  classes: TeacherClassForStudentPublic[]
}
