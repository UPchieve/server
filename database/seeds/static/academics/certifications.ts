import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'
import client from '../../pgClient'

export async function certifications(): Promise<NameToId> {
  const certifications = [
    'prealgebra',
    'statistics',
    'geometry',
    'biology',
    'chemistry',
    'physicsOne',
    'physicsTwo',
    'environmentalScience',
    'essays',
    'applications',
    'planning',
    'satMath',
    'satReading',
    'collegeCounseling',
    'humanitiesEssays',
    'algebraOne',
    'algebraTwo',
    'trigonometry',
    'precalculus',
    'calculusAB',
    'calculusBC',
  ]
  const temp: NameToId = {}
  for (const cert of certifications) {
    temp[cert] = await wrapInsert(
      'certifications',
      pgQueries.insertCertification.run,
      { name: cert }
    )
  }
  return temp
}

export async function getCertIds(): Promise<NameToId> {
  const temp: NameToId = {}
  const certs = await pgQueries.getCertifications.run(undefined, client)

  for (const cert of certs) {
    temp[cert.name] = cert.id
  }

  return temp
}
