import type { Uuid } from '../types/shared'
import type { TeacherClassPublic } from './teachers'

export type FavoriteVolunteerPublic = {
  volunteerId: Uuid
  firstName: string
  numSessions: number
}

export type StudentPartnerOrgInstancePublic = {
  name: string
  id: Uuid
  schoolId?: Uuid
  siteName?: string
}

export type RemainingFavoriteAmountResponse = {
  remaining: number
}

export type FavoriteVolunteersResponse = {
  favoriteVolunteers: FavoriteVolunteerPublic[]
  isLastPage: boolean
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
  classes: TeacherClassPublic[]
}
