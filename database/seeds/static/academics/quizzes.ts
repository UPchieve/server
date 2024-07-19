import { wrapInsert, NameToId } from '../../utils'
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
    'upchieve101',
    'reading',
    'anatomy',
    'financialAid',
    'applicationEssays',
    'collegeApps',
    'collegeList',
    'collegePrep',
    'essayPlanning',
    'essayFeedback',
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
      quizId: quizIds['algebraOne'] as number,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      quizId: quizIds['algebraOne'] as number,
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
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'rational exponents and radicals',
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'application of linear equations',
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'two variable equations',
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'rational expressions',
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'complex numbers',
      quizId: quizIds['algebraOne'] as number,
    },
    {
      name: 'functions_domain_range',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'higher_degree_polynomials',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'square_root_equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'roots_of_polynomials',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'multiply_polynomials_binomial',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'rational_radical_absolute',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'logarithms_properties',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'rational_expressions',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'systems_of_linear_equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'arithmetic_and_geometric_sequences',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'functions_domain',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'solving_linear_equations',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'function_transformations_shifts',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'graphing_quadratic_functions',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'exponential_functions_growth',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'rounding_and_scientific_notation',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'square root_equations_quadratic',
      quizId: quizIds['algebraTwo'] as number,
    },
    {
      name: 'advanced_factoring_techniques',
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
      name: 'two proportions',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'levels of measurement',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'types of sampling',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'finding probability',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'finding x from z score',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'z score',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'basic set operations',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'compound events',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'conditional probability',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'independent probability',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'permutations and combinations',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'random variables distributions',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'relationships between variables',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'confidence intervals',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'interpreting pvalue',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'finding the test statistic',
      quizId: quizIds['statistics'] as number,
    },
    {
      name: 'rectangular coordinates',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'linear inequalities',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'functions',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'rational exponents',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'quadratic functions',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'logarithms and exponents',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'absolute extrema',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'antiderivatives',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'area between curves',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'chain rule',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'concavity',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'continuity',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'derivatives',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'differential equations',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'fundamental theorem',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'lhopitals rule',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'implicit differentiation',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'mean value theorem',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'optimization',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'reimann sums',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'related rates',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'relative extrema',
      quizId: quizIds['calculusAB'] as number,
    },
    {
      name: 'absolute extrema',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'antiderivatives',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'area between curves',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'chain rule',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'derivatives',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'differential equations',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'fundamental theorem of calculus',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'implicit differentiation',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'infinite sequences',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'limits',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'integration by parts',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'mean value theorem',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'optimization',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'parametric',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'reimann sums',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'relative extrema',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'taylor polynomials',
      quizId: quizIds['calculusBC'] as number,
    },
    {
      name: 'basic',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'commonapp',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'answer',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'dhistory',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'optional',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'supplemental',
      quizId: quizIds['essays'] as number,
    },
    {
      name: 'exam',
      quizId: quizIds['planning'] as number,
    },
    {
      name: 'type',
      quizId: quizIds['planning'] as number,
    },
    {
      name: 'LOR',
      quizId: quizIds['planning'] as number,
    },
    {
      name: 'basic',
      quizId: quizIds['planning'] as number,
    },
    {
      name: 'timeline',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'resume',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'schools',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'fees',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'FinAid',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'LOR',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'basic',
      quizId: quizIds['applications'] as number,
    },
    {
      name: 'biochemistry',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'the cell',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'cell division',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'cellular respiration',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'photosynthesis and plants',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'classical genetics',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'molecular genetics',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'animal behavior and physiology',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'ecology',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'human physiology and anatomy',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'evolution and taxonomy',
      quizId: quizIds['biology'] as number,
    },
    {
      name: 'chemical reactions',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'atoms, compounds, and ions',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'stoichiometry',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'electron structure of atoms',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'periodic table',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'chemical bonds',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'gases',
      quizId: quizIds['chemistry'] as number,
    },

    {
      name: 'states of matter and intermolecular forces',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'chemical equilibrium',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'acids and bases',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'buffers, titrations, and solubility equilibria',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'thermodynamics',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'redox reactions and electrochemistry',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'kinetics',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'nuclear chemistry',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'kinematics',
      quizId: quizIds['chemistry'] as number,
    },
    {
      name: 'kinematics',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: "newton's laws",
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'rotational mechanics',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'work and energy',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'momentum and collisions',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'thermodynamics',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'electrostatics',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'magnetism',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'waves and sound',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'refraction and reflection',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'gravity/gen relativity',
      quizId: quizIds['physicsOne'] as number,
    },
    {
      name: 'Fluids - density and pressure',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Fluids - dynamics',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'THD - Ideal Gases',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'thermodynamics',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Electric Field',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Electric Potential',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Magnetic Fields',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Magnetic Induction',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Electromagnetic Waves',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Optics - refraction and reflection',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Quantum & Atomic Physics',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'dynamics 2',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'Electric Circuits',
      quizId: quizIds['physicsTwo'] as number,
    },
    {
      name: 'earth systems and resources',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'ecology',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'energy resources and consumption',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'global change',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'impact of human health and environment',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'interdependence of organisms',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'land and water resources and use',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'introduction to environmental science',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'natural biogeochemical cycles',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'pollution',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'populations',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'the atmosphere',
      quizId: quizIds['environmentalScience'] as number,
    },
    {
      name: 'upchieve',
      quizId: quizIds['upchieve101'] as number,
    },
    {
      name: 'linear_equations',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'linear_inequalities',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'linear_functions',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'quadratic_problems',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'nonlinear_equations',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'rational_expressions',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'isolating_quantities',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'linear_systems',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'ratios_rates',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'units',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'percentages',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'linear_and_exponential',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'data_inferences',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'volume_word_problems',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'complex_numbers',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'circle_equations',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'table_data',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'scatterplots',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'graphs',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'shape_of_distributions',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'right_triangle_problems',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'congruence_and_similarity',
      quizId: quizIds['satMath'] as number,
    },
    {
      name: 'explict_v_implicit',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'point_of_view',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'analyzing_relationships',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'citing_evidence',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'summarizing',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'analogical_reasoning',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'structure_passage',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'word_choice',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'graphs_and_data',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'purpose_of_text',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'analyzing_arguments',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'connecting_texts',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'history_passages',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'strategies',
      quizId: quizIds['satReading'] as number,
    },
    {
      name: 'types_of_essays',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'essay_structure',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'point_of_view',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'persuasive_techniques',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'citations',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'independent_and_dependent_clauses',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'punctuation',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'verb_tense',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'subject_verb_agreement',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'specificity_and_coherence',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'plagiarism',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'nonvarying_sentence_length',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'wordiness',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'grammatical_errors',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    {
      name: 'common_requests',
      quizId: quizIds['humanitiesEssays'] as number,
    },
    { name: 'inference', quizId: quizIds['satReading'] as number },
    { name: 'integumentary', quizId: quizIds['anatomy'] as number },
    { name: 'little_detail', quizId: quizIds['satReading'] as number },
    { name: 'lymphatic', quizId: quizIds['anatomy'] as number },
    { name: 'muscular', quizId: quizIds['anatomy'] as number },
    { name: 'nervous', quizId: quizIds['anatomy'] as number },
    { name: 'probingqs', quizId: quizIds['reading'] as number },
    { name: 'questions', quizId: quizIds['reading'] as number },
    { name: 'reproductive', quizId: quizIds['anatomy'] as number },
    { name: 'respiratory', quizId: quizIds['anatomy'] as number },
    { name: 'sense_organs', quizId: quizIds['anatomy'] as number },
    { name: 'skeletal', quizId: quizIds['anatomy'] as number },
    { name: 'texttype', quizId: quizIds['reading'] as number },
    { name: 'tissues', quizId: quizIds['anatomy'] as number },
    { name: 'urinary', quizId: quizIds['anatomy'] as number },
    { name: 'vocab_in_context', quizId: quizIds['satReading'] as number },
    { name: 'vocabulary', quizId: quizIds['reading'] as number },
    { name: 'activatebk', quizId: quizIds['reading'] as number },
    { name: 'author_technique', quizId: quizIds['satReading'] as number },
    { name: 'backgroundknowledge', quizId: quizIds['reading'] as number },
    { name: 'big_picture', quizId: quizIds['satReading'] as number },
    { name: 'cells', quizId: quizIds['anatomy'] as number },
    { name: 'circulatory_system', quizId: quizIds['anatomy'] as number },
    { name: 'comprehensionsupport', quizId: quizIds['reading'] as number },
    { name: 'context', quizId: quizIds['reading'] as number },
    { name: 'corrections', quizId: quizIds['reading'] as number },
    { name: 'digestive', quizId: quizIds['anatomy'] as number },
    { name: 'editing', quizId: quizIds['reading'] as number },
    { name: 'endocrine', quizId: quizIds['anatomy'] as number },
    { name: 'evidence_support', quizId: quizIds['satReading'] as number },
    { name: 'function', quizId: quizIds['satReading'] as number },
    { name: 'strategies', quizId: quizIds['satMath'] as number },

    { name: 'unit circle', quizId: quizIds['trigonometry'] as number },
    { name: 'dynamics 1', quizId: quizIds['physicsOne'] as number },
    { name: 'energy 1', quizId: quizIds['physicsOne'] as number },
    { name: 'dynamics 2', quizId: quizIds['physicsOne'] as number },
    { name: 'energy 2', quizId: quizIds['physicsOne'] as number },
    { name: 'pythagorean theorem', quizId: quizIds['trigonometry'] as number },
    { name: 'degrees and radians', quizId: quizIds['trigonometry'] as number },
    {
      name: 'graphing trig functions',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'inverse trig functions',
      quizId: quizIds['trigonometry'] as number,
    },
    {
      name: 'trigonometric identities',
      quizId: quizIds['trigonometry'] as number,
    },
    { name: 'complex numbers', quizId: quizIds['precalculus'] as number },
    { name: 'conic sections', quizId: quizIds['precalculus'] as number },
    {
      name: 'graphing exponential functions',
      quizId: quizIds['precalculus'] as number,
    },
    { name: 'graphing polynomials', quizId: quizIds['precalculus'] as number },
    {
      name: 'graphing rational functions',
      quizId: quizIds['precalculus'] as number,
    },
    { name: 'logarithms', quizId: quizIds['precalculus'] as number },
    { name: 'inverse functions', quizId: quizIds['precalculus'] as number },
    { name: 'polynomial division', quizId: quizIds['precalculus'] as number },
    { name: 'rational expressions', quizId: quizIds['precalculus'] as number },
    { name: 'sequences series', quizId: quizIds['precalculus'] as number },
    {
      name: 'exponential logarithmic equations',
      quizId: quizIds['precalculus'] as number,
    },
    { name: 'other equations', quizId: quizIds['precalculus'] as number },
    {
      name: 'quadratic and absolute',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'solving quadratic equations',
      quizId: quizIds['precalculus'] as number,
    },
    {
      name: 'transformations functions',
      quizId: quizIds['precalculus'] as number,
    },
    { name: 'vectors', quizId: quizIds['precalculus'] as number },
    { name: 'trig functions', quizId: quizIds['trigonometry'] as number },
    {
      name: 'random variables and distributions',
      quizId: quizIds['statistics'] as number,
    },
    { name: 'kinematics 2', quizId: quizIds['physicsOne'] as number },
    { name: 'DC Circuits', quizId: quizIds['physicsOne'] as number },
    { name: 'rotational motion', quizId: quizIds['physicsOne'] as number },
    { name: 'polynomials', quizId: quizIds['satMath'] as number },
    { name: 'functions', quizId: quizIds['satMath'] as number },
    { name: 'angles', quizId: quizIds['satMath'] as number },
    // maybe needs to be in a test seeds...
    { name: 'true cost', quizId: quizIds['financialAid'] as number },
    { name: 'needblind', quizId: quizIds['financialAid'] as number },
    { name: 'FAFSA', quizId: quizIds['financialAid'] as number },
    { name: 'source', quizId: quizIds['financialAid'] as number },
    { name: 'CSS', quizId: quizIds['financialAid'] as number },
    { name: 'scholarships', quizId: quizIds['financialAid'] as number },
    { name: '100', quizId: quizIds['financialAid'] as number },
    { name: 'cost', quizId: quizIds['financialAid'] as number },
    { name: 'residency', quizId: quizIds['financialAid'] as number },
    { name: 'state aid', quizId: quizIds['financialAid'] as number },
    { name: 'direct', quizId: quizIds['financialAid'] as number },
    { name: 'timeline', quizId: quizIds['financialAid'] as number },
    { name: 'FAFSA advanced', quizId: quizIds['financialAid'] as number },
    { name: 'type', quizId: quizIds['financialAid'] as number },
    { name: 'special', quizId: quizIds['financialAid'] as number },
    { name: 'free tuition', quizId: quizIds['financialAid'] as number },
    { name: 'basic', quizId: quizIds['financialAid'] as number },
    { name: 'length', quizId: quizIds['applicationEssays'] as number },
    { name: 'basic', quizId: quizIds['applicationEssays'] as number },
    { name: 'unique', quizId: quizIds['applicationEssays'] as number },
    { name: 'revision', quizId: quizIds['applicationEssays'] as number },
    {
      name: 'supplemental basic',
      quizId: quizIds['applicationEssays'] as number,
    },
    { name: 'needed', quizId: quizIds['applicationEssays'] as number },
    { name: 'topic', quizId: quizIds['applicationEssays'] as number },
    { name: 'safety', quizId: quizIds['applicationEssays'] as number },
    {
      name: 'supplemental advanced',
      quizId: quizIds['applicationEssays'] as number,
    },
    { name: 'edit', quizId: quizIds['applicationEssays'] as number },
    { name: 'common app', quizId: quizIds['collegeApps'] as number },
    { name: 'programs', quizId: quizIds['collegeApps'] as number },
    { name: 'SAT', quizId: quizIds['collegeApps'] as number },
    { name: 'ED', quizId: quizIds['collegeApps'] as number },
    { name: 'timeline', quizId: quizIds['collegeApps'] as number },
    { name: 'components', quizId: quizIds['collegeApps'] as number },
    { name: 'email', quizId: quizIds['collegeApps'] as number },
    { name: 'transcript', quizId: quizIds['collegeApps'] as number },
    { name: 'tests', quizId: quizIds['collegeApps'] as number },
    { name: 'test advising', quizId: quizIds['collegeApps'] as number },
    { name: 'EC', quizId: quizIds['collegeApps'] as number },
    { name: 'other', quizId: quizIds['collegeApps'] as number },
    { name: 'letters', quizId: quizIds['collegeApps'] as number },
    { name: 'fee', quizId: quizIds['collegeApps'] as number },
    { name: 'dhistory', quizId: quizIds['collegeApps'] as number },
    { name: 'preference', quizId: quizIds['collegeList'] as number },
    { name: 'basic', quizId: quizIds['collegeList'] as number },
    { name: 'public', quizId: quizIds['collegeList'] as number },
    { name: 'cost', quizId: quizIds['collegeList'] as number },
    { name: 'majors', quizId: quizIds['collegeList'] as number },
    { name: 'community college', quizId: quizIds['collegeList'] as number },
    { name: 'financial', quizId: quizIds['collegeList'] as number },
    { name: 'reach', quizId: quizIds['collegeList'] as number },
    { name: 'balance', quizId: quizIds['collegeList'] as number },
    { name: 'research', quizId: quizIds['collegeList'] as number },
    { name: 'advising', quizId: quizIds['collegeList'] as number },
    { name: 'type', quizId: quizIds['collegeList'] as number },
    { name: 'grades', quizId: quizIds['collegePrep'] as number },
    { name: 'ninth', quizId: quizIds['collegePrep'] as number },
    { name: 'eleventh', quizId: quizIds['collegePrep'] as number },
    { name: 'national merit ', quizId: quizIds['collegePrep'] as number },
    { name: 'extracurricular', quizId: quizIds['collegePrep'] as number },
    { name: 'flyin', quizId: quizIds['collegePrep'] as number },
    { name: 'courses', quizId: quizIds['collegePrep'] as number },
    { name: 'major', quizId: quizIds['collegePrep'] as number },
    { name: 'lor', quizId: quizIds['collegePrep'] as number },
    { name: 'timeline', quizId: quizIds['collegePrep'] as number },
    { name: 'basic', quizId: quizIds['collegePrep'] as number },
    { name: 'type', quizId: quizIds['collegePrep'] as number },
    { name: 'type of essays', quizId: quizIds['essayPlanning'] as number },
    { name: 'role', quizId: quizIds['essayPlanning'] as number },
    { name: 'stages of writing ', quizId: quizIds['essayPlanning'] as number },
    { name: 'starting a session', quizId: quizIds['essayPlanning'] as number },
    { name: 'set expectations ', quizId: quizIds['essayPlanning'] as number },
    { name: 'planning steps', quizId: quizIds['essayPlanning'] as number },
    { name: '3 key ideas ', quizId: quizIds['essayPlanning'] as number },
    { name: 'gather information', quizId: quizIds['essayPlanning'] as number },
    { name: 'thesis', quizId: quizIds['essayPlanning'] as number },
    { name: 'outlines', quizId: quizIds['essayPlanning'] as number },
    { name: 'outlines applied', quizId: quizIds['essayPlanning'] as number },
    { name: 'drafting', quizId: quizIds['essayPlanning'] as number },
    { name: 'tricky', quizId: quizIds['essayPlanning'] as number },
    { name: 'common requests', quizId: quizIds['essayPlanning'] as number },
    { name: 'essay structure', quizId: quizIds['essayPlanning'] as number },
    { name: 'types of essays', quizId: quizIds['essayPlanning'] as number },
    { name: 'types of essays', quizId: quizIds['essayFeedback'] as number },
    { name: 'basics', quizId: quizIds['essayFeedback'] as number },
    { name: 'thesis', quizId: quizIds['essayFeedback'] as number },
    { name: 'details', quizId: quizIds['essayFeedback'] as number },
    { name: 'structure', quizId: quizIds['essayFeedback'] as number },
    { name: 'unity', quizId: quizIds['essayFeedback'] as number },
    { name: 'conclusion', quizId: quizIds['essayFeedback'] as number },
    { name: 'passage thesis', quizId: quizIds['essayFeedback'] as number },
    { name: 'role', quizId: quizIds['essayFeedback'] as number },
    { name: 'stages of writing', quizId: quizIds['essayFeedback'] as number },
    { name: 'starting a session', quizId: quizIds['essayFeedback'] as number },
    { name: 'point of view', quizId: quizIds['essayFeedback'] as number },
    { name: 'citations', quizId: quizIds['essayFeedback'] as number },
    {
      name: 'independent and dependent clauses',
      quizId: quizIds['essayFeedback'] as number,
    },
    { name: 'punctuation', quizId: quizIds['essayFeedback'] as number },
    {
      name: 'subject verb agreement',
      quizId: quizIds['essayFeedback'] as number,
    },
    {
      name: 'specificity and coherence',
      quizId: quizIds['essayFeedback'] as number,
    },
    { name: 'plagiarism', quizId: quizIds['essayFeedback'] as number },
    {
      name: 'nonvarying sentence length',
      quizId: quizIds['essayFeedback'] as number,
    },
    { name: 'wordiness', quizId: quizIds['essayFeedback'] as number },
    { name: 'grammatical errors', quizId: quizIds['essayFeedback'] as number },
    { name: 'common requests', quizId: quizIds['essayFeedback'] as number },
    { name: 'passage details', quizId: quizIds['essayFeedback'] as number },
    { name: 'passage structure', quizId: quizIds['essayFeedback'] as number },
    { name: 'passage unity', quizId: quizIds['essayFeedback'] as number },
    { name: 'passage conclusion', quizId: quizIds['essayFeedback'] as number },
  ]
  for (const sub of quizSubs) {
    const subId = await wrapInsert(
      'quiz_subcategories',
      pgQueries.insertQuizSubcategory.run,
      { name: sub.name, quizId: sub.quizId }
    )

    await wrapInsert('quiz_questions', pgQueries.insertQuizQuestion.run, {
      correctAnswer: 'a',
      subCategoryId: subId,
      possibleAnswers:
        '[{"_id":{"$oid":"5ccfbc95d61b9d689328c530"},"txt":"A","val":"a"},{"_id":{"$oid":"5ccfbc95d61b9d689328c52f"},"txt":"B","val":"b"},{"_id":{"$oid":"5ccfbc95d61b9d689328c52e"},"txt":"C","val":"c"},{"_id":{"$oid":"5ccfbc95d61b9d689328c52d"},"txt":"D","val":"d"}]',
      questionText: 'The answer is A',
    })
  }
}
