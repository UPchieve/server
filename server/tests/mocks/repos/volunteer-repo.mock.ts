import { Ulid } from '../../../models/pgUtils'
import * as VolunteerRepo from '../../../models/Volunteer'
import { CERTS } from '../../../constants'

// TODO: Think of a better API for this function
export const buildQuizMap = (
  desiredCerts: CERTS[],
  failedCerts: CERTS[] = []
): VolunteerRepo.Certifications => {
  const map: VolunteerRepo.Certifications = {}
  for (const cert of desiredCerts) {
    map[cert] = {
      passed: true,
      tries: 1,
      lastAttemptedAt: new Date(),
    }
  }

  for (const cert of failedCerts) {
    map[cert] = {
      passed: false,
      tries: 1,
      lastAttemptedAt: new Date(),
    }
  }

  return map
}

export const buildVolunteerQuizMap = (
  userId: Ulid,
  desiredCerts: CERTS[],
  failedCerts: CERTS[] = []
): VolunteerRepo.VolunteerQuizMap => {
  const certs = buildQuizMap(desiredCerts, failedCerts)
  return {
    [userId]: {
      ...certs,
    },
  }
}
