import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getIdByNameFailsafe } from '../utils'

export async function certifications() {
  await db
    .insert('certifications', [
      { updated_at: new Date(), created_at: new Date(), name: 'prealgebra' },
      { updated_at: new Date(), created_at: new Date(), name: 'statistics' },
      { updated_at: new Date(), created_at: new Date(), name: 'geometry' },
      { updated_at: new Date(), created_at: new Date(), name: 'biology' },
      { updated_at: new Date(), created_at: new Date(), name: 'chemistry' },
      { updated_at: new Date(), created_at: new Date(), name: 'physicsOne' },
      { updated_at: new Date(), created_at: new Date(), name: 'physicsTwo' },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'environmentalScience',
      },
      { updated_at: new Date(), created_at: new Date(), name: 'essays' },
      { updated_at: new Date(), created_at: new Date(), name: 'applications' },
      { updated_at: new Date(), created_at: new Date(), name: 'planning' },
      { updated_at: new Date(), created_at: new Date(), name: 'satMath' },
      { updated_at: new Date(), created_at: new Date(), name: 'satReading' },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'collegeCounseling',
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'humanitiesEssays',
      },
      { updated_at: new Date(), created_at: new Date(), name: 'algebraOne' },
      { updated_at: new Date(), created_at: new Date(), name: 'algebraTwo' },
      { updated_at: new Date(), created_at: new Date(), name: 'trigonometry' },
      { updated_at: new Date(), created_at: new Date(), name: 'precalculus' },
      { updated_at: new Date(), created_at: new Date(), name: 'calculusAB' },
      { updated_at: new Date(), created_at: new Date(), name: 'calculusBC' },
    ])
    .run(pool)
}
