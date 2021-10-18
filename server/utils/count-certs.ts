import { ALL_CERTS_TYPE, Certifications } from '../models/Volunteer'

const countCerts = (certifications: Certifications) => {
  let numCerts = 0
  for (const subject in certifications) {
    if (certifications[subject as ALL_CERTS_TYPE].passed) {
      numCerts += 1
    }
  }
  return numCerts
}

export default countCerts
