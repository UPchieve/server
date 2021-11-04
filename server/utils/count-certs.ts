import { Certifications } from '../models/Volunteer'

const countCerts = (certifications: Certifications) => {
  let numCerts = 0
  for (const subject in certifications) {
    if (certifications[subject as keyof Certifications].passed) {
      numCerts += 1
    }
  }
  return numCerts
}

export default countCerts
