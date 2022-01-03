import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getIdByNameFailsafe } from '../utils'

export async function quizzes() {
  await db
    .insert('quizzes', [
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

export async function quizCertificationGrants() {
  await db
    .insert('quiz_certification_grants', [
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'statistics'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'statistics'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'geometry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'biology'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'biology'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'chemistry'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'chemistry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'physicsOne'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'physicsOne'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'physicsTwo'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'physicsTwo'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'environmentalScience'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'environmentalScience'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'essays'),
        certification_id: await getIdByNameFailsafe('certifications', 'essays'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'applications'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'applications'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'planning'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'planning'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'satMath'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'satMath'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'satReading'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'satReading'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'collegeCounseling'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'planning'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'collegeCounseling'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'applications'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'humanitiesEssays'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'humanitiesEssays'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'precalculus'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'precalculus'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusAB'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'calculusAB'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'precalculus'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'calculusAB'
        ),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculusBC'),
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'calculusBC'
        ),
      },
    ])
    .run(pool)
}

export async function quizSubcategories() {
  await db
    .insert('quiz_subcategories', [
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'numbers',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'arithmetic properties',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'exponents',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'exponents and radicals',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'polynomials',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'fractions',
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'linear equations',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'rational exponents and radicals',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'application of linear equations',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'two variable equations',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'rational expressions',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'complex numbers',
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'congruence and similarity',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'vertices',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'angles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'circles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'triangles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'rectangles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'angles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'triangles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'right triangles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'quadrants',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'radians',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'unit circles',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'inequalities',
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'representing data numerically',
        quiz_id: await getIdByNameFailsafe('quizzes', 'statistics'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'representing data graphically',
        quiz_id: await getIdByNameFailsafe('quizzes', 'statistics'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'two means',
        quiz_id: await getIdByNameFailsafe('quizzes', 'statistics'),
      },
      {
        updated_at: new Date(),
        created_at: new Date(),
        name: 'representing data graphically',
        quiz_id: await getIdByNameFailsafe('quizzes', 'statistics'),
      },
    ])
    .run(pool)
}
