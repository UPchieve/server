import type { VolunteerToReviewPublic } from '../contracts/volunteers'
import type { VolunteerToReview } from '../models/Volunteer'

export function toVolunteerToReviewPublic(
  volunteer: VolunteerToReview
): VolunteerToReviewPublic {
  return {
    id: volunteer.id,
    _id: volunteer.id,
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    firstname: volunteer.firstName,
    lastname: volunteer.lastName,
    email: volunteer.email,
    createdAt: volunteer.createdAt.toISOString(),
    readyForReviewAt: volunteer.readyForReviewAt.toISOString(),
  }
}
