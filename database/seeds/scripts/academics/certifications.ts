import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

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
