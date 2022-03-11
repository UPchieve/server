import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'
import client from '../../pgClient'

export async function quizzes(): Promise<NameToId> {
  const quizzes = [
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
  for (const quiz of quizzes) {
    temp[quiz] = await wrapInsert('quizzes', pgQueries.insertQuiz.run, {
      name: quiz,
    })
  }
  return temp
}

export async function getQuizIds(): Promise<NameToId> {
  const temp: NameToId = {}
  const quizzes = await pgQueries.getQuizzes.run(undefined, client)

  for (const quiz of quizzes) {
    temp[quiz.name] = quiz.id
  }

  return temp
}

export async function quizCertificationGrants(
  quizIds: NameToId,
  certIds: NameToId
) {
  const certGrants = [
    {
      quizId: quizIds['prealgebra'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      quizId: quizIds['statistics'] as number,
      certificationId: certIds['statistics'] as number,
    },
    {
      quizId: quizIds['geometry'] as number,
      certificationId: certIds['geometry'] as number,
    },
    {
      quizId: quizIds['biology'] as number,
      certificationId: certIds['biology'] as number,
    },
    {
      quizId: quizIds['chemistry'] as number,
      certificationId: certIds['chemistry'] as number,
    },
    {
      quizId: quizIds['physicsOne'] as number,
      certificationId: certIds['physicsOne'] as number,
    },
    {
      quizId: quizIds['physicsTwo'] as number,
      certificationId: certIds['physicsTwo'] as number,
    },
    {
      quizId: quizIds['environmentalScience'] as number,
      certificationId: certIds['environmentalScience'] as number,
    },
    {
      quizId: quizIds['essays'] as number,
      certificationId: certIds['essays'] as number,
    },
    {
      quizId: quizIds['applications'] as number,
      certificationId: certIds['applications'] as number,
    },
    {
      quizId: quizIds['planning'] as number,
      certificationId: certIds['planning'] as number,
    },
    {
      quizId: quizIds['satMath'] as number,
      certificationId: certIds['satMath'] as number,
    },
    {
      quizId: quizIds['satReading'] as number,
      certificationId: certIds['satReading'] as number,
    },
    {
      quizId: quizIds['collegeCounseling'] as number,
      certificationId: certIds['planning'] as number,
    },
    {
      quizId: quizIds['collegeCounseling'] as number,
      certificationId: certIds['applications'] as number,
    },
    {
      quizId: quizIds['humanitiesEssays'] as number,
      certificationId: certIds['humanitiesEssays'] as number,
    },
    {
      quizId: quizIds['algebraTwo'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      quizId: quizIds['algebraTwo'] as number,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      quizId: quizIds['algebraTwo'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      quizId: quizIds['trigonometry'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      quizId: quizIds['precalculus'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      quizId: quizIds['precalculus'] as number,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      quizId: quizIds['precalculus'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      quizId: quizIds['precalculus'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      quizId: quizIds['precalculus'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      quizId: quizIds['calculusAB'] as number,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['precalculus'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      quizId: quizIds['calculusBC'] as number,
      certificationId: certIds['calculusBC'] as number,
    },
  ]
  for (const grant of certGrants) {
    await wrapInsert(
      'quiz_certification_grants',
      pgQueries.insertCertificationGrant.run,
      { quizId: grant.quizId, certificationId: grant.certificationId }
    )
  }
}

export async function quizSubcategories(quizIds: NameToId) {
  const quizSubs = [
    {
      name: 'numbers',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'arithmetic properties',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'exponents',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'exponents and radicals',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'polynomials',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'fractions',
      quizId: quizIds['prealgebra'] as number,
    },
    {
      name: 'linear equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'rational exponents and radicals',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'application of linear equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'two variable equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'rational expressions',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'complex numbers',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'congruence and similarity',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'vertices',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'angles',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'circles',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'triangles',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'rectangles',
      quizId: quizIds['geometry'] as number,
    },
    {
      name: 'angles',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'triangles',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'right triangles',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'quadrants',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'radians',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'unit circles',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'inequalities',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'representing data numerically',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'representing data graphically',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'two means',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'representing data graphically',
      quizId: quizIds['statistics'] as number,
    },
  ]
  for (const sub of quizSubs) {
    await wrapInsert(
      'quiz_subcategories',
      pgQueries.insertQuizSubcategory.run,
      { name: sub.name, quizId: sub.quizId }
    )
  }
}
