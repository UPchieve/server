import { Certifications } from '../models/Volunteer'
import { ALL_CERTS_TYPE } from '../constants'

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
