import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'
import type { AvailabilityAggregation } from '../controllers/VolunteersCtrl'
import type { VolunteerSubjectPresenceMap } from '../services/VolunteerService'

export type VolunteerToReviewPublic = {
  id: Uuid
  _id: Uuid
  firstName: string
  lastName: string
  firstname: string
  lastname: string
  email: string
  createdAt: ISODateString
  readyForReviewAt: ISODateString
}

export type AggregateAvailabitiesResponse = {
  msg: 'Users retreived from database'
  aggAvailabilities: AvailabilityAggregation
}

export type VolunteersToReviewResponse = {
  volunteers: VolunteerToReviewPublic[]
  isLastPage: boolean
}

export type LastHoursUpdatedResponse = {
  lastUpdated: string
}

export type VolunteerPresenceResponse = {
  presenceBySubject: VolunteerSubjectPresenceMap
}
