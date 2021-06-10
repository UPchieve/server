import { Certification, Subject, ComputedSubject } from './types'

const PREALGEBRA: Subject = {
  key: 'prealgebra',
  displayName: 'Pre-algebra',
  launched: true
}
const ALGEBRA_ONE: Subject = {
  key: 'algebraOne',
  displayName: 'Algebra 1',
  launched: true
}
const ALGEBRA_TWO: Subject = {
  key: 'algebraTwo',
  displayName: 'Algebra 2',
  launched: true
}
const GEOMETRY: Subject = {
  key: 'geometry',
  displayName: 'Geometry',
  launched: true
}
const TRIGONOMETRY: Subject = {
  key: 'trigonometry',
  displayName: 'Trigonometry',
  launched: true
}
const PRECALCULUS: Subject = {
  key: 'precalculus',
  displayName: 'Precalculus',
  launched: true
}
const CALCULUS_AB: Subject = {
  key: 'calculusAB',
  displayName: 'Calculus AB',
  launched: true
}
const CALCULUS_BC: Subject = {
  key: 'calculusBC',
  displayName: 'Calculus BC',
  launched: true
}
const STATISTICS: Subject = {
  key: 'statistics',
  displayName: 'Statistics',
  launched: true
}

export interface MATH_CERTS_TYPE {
  PREALGEBRA: Certification
  ALGEBRA: Certification
  GEOMETRY: Certification
  TRIGONOMETRY: Certification
  PRECALCULUS: Certification
  CALCULUS_AB: Certification
  CALCULUS_BC: Certification
  STATISTICS: Certification
}

export const MATH_CERTS: MATH_CERTS_TYPE = {
  PREALGEBRA: {
    key: PREALGEBRA.key,
    displayName: PREALGEBRA.displayName,
    numQuestions: 2,
    unlocks: [PREALGEBRA],
    subCategories: [
      'numbers',
      'arithmetic properties',
      'exponents',
      'exponents and radicals',
      'polynomials',
      'fractions'
    ]
  },
  ALGEBRA: {
    key: 'algebra',
    displayName: 'Algebra',
    numQuestions: 2,
    unlocks: [PREALGEBRA, ALGEBRA_ONE, ALGEBRA_TWO],
    subCategories: [
      'linear equations',
      'rational exponents and radicals',
      'application of linear equations',
      'two variable equations',
      'rational expressions',
      'complex numbers'
    ]
  },
  GEOMETRY: {
    key: GEOMETRY.key,
    displayName: GEOMETRY.displayName,
    numQuestions: 2,
    unlocks: [GEOMETRY],
    subCategories: [
      'congruence and similarity',
      'vertices',
      'angles',
      'circles',
      'triangles',
      'rectangles'
    ]
  },
  TRIGONOMETRY: {
    key: TRIGONOMETRY.key,
    displayName: TRIGONOMETRY.displayName,
    numQuestions: 2,
    unlocks: [TRIGONOMETRY],
    subCategories: [
      'angles',
      'triangles',
      'right triangles',
      'quadrants',
      'radians',
      'unit circle',
      'inequalities'
    ]
  },
  PRECALCULUS: {
    key: PRECALCULUS.key,
    displayName: PRECALCULUS.displayName,
    numQuestions: 2,
    unlocks: [PREALGEBRA, ALGEBRA_ONE, ALGEBRA_TWO, TRIGONOMETRY],
    subCategories: [
      'rectangular coordinates',
      'linear inequalities',
      'functions',
      'rational exponents',
      'quadratic functions',
      'logarithms and exponents'
    ]
  },
  CALCULUS_AB: {
    key: CALCULUS_AB.key,
    displayName: CALCULUS_AB.displayName,
    numQuestions: 1,
    unlocks: [PREALGEBRA, ALGEBRA_ONE, ALGEBRA_TWO, TRIGONOMETRY, PRECALCULUS],
    subCategories: [
      'absolute extrema',
      'antiderivatives',
      'area between curves',
      'chain rule',
      'concavity',
      'continuity',
      'derivatives',
      'differential equations',
      'fundamental theorem',
      'lhopitals rule',
      'implicit differentiation',
      'mean value theorem',
      'optimization',
      'reimann sums',
      'related rates',
      'relative extrema'
    ]
  },
  CALCULUS_BC: {
    key: CALCULUS_BC.key,
    displayName: CALCULUS_BC.displayName,
    numQuestions: 1,
    unlocks: [
      PREALGEBRA,
      ALGEBRA_ONE,
      ALGEBRA_TWO,
      TRIGONOMETRY,
      PRECALCULUS,
      CALCULUS_AB
    ],
    subCategories: [
      'absolute extrema',
      'antiderivatives',
      'area between curves',
      'chain rule',
      'derivatives',
      'differential equations',
      'fundamental theorem of calculus',
      'implicit differentiation',
      'infinite sequences',
      'limits',
      'integration by parts',
      'mean value theorem',
      'optimization',
      'parametric',
      'reimann sums',
      'relative extrema',
      'taylor polynomials'
    ]
  },
  STATISTICS: {
    key: STATISTICS.key,
    displayName: STATISTICS.displayName,
    numQuestions: 1,
    unlocks: [STATISTICS],
    subCategories: [
      'representing data numerically',
      'representing data graphically',
      'two means',
      'two proportions',
      'levels of measurement',
      'types of sampling',
      'finding probability',
      'finding x from z score',
      'z score',
      'basic set operations',
      'compound events',
      'conditional probability',
      'independent probability',
      'permutations and combinations',
      'random variables distributions',
      'relationships between variables',
      'confidence intervals',
      'interpreting pvalue',
      'finding the test statistic'
    ]
  }
}

const INTEGRATED_MATH_ONE: ComputedSubject = {
  key: 'integratedMathOne',
  displayName: 'Integrated Math 1',
  launched: true,
  certifications: [
    MATH_CERTS.ALGEBRA,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS
  ]
}
const INTEGRATED_MATH_TWO: ComputedSubject = {
  key: 'integratedMathTwo',
  displayName: 'Integrated Math 2',
  launched: true,
  certifications: [
    MATH_CERTS.ALGEBRA,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS,
    MATH_CERTS.TRIGONOMETRY
  ]
}
const INTEGRATED_MATH_THREE: ComputedSubject = {
  key: 'integratedMathThree',
  displayName: 'Integrated Math 3',
  launched: true,
  certifications: [MATH_CERTS.PRECALCULUS, MATH_CERTS.STATISTICS]
}
const INTEGRATED_MATH_FOUR: ComputedSubject = {
  key: 'integratedMathFour',
  displayName: 'Integrated Math 4',
  launched: true,
  certifications: [MATH_CERTS.PRECALCULUS]
}

export interface MATH_SUBJECTS_TYPE {
  PREALGEBRA: Subject
  ALGEBRA_ONE: Subject
  ALGEBRA_TWO: Subject
  GEOMETRY: Subject
  TRIGONOMETRY: Subject
  PRECALCULUS: Subject
  CALCULUS_AB: Subject
  CALCULUS_BC: Subject
  STATISTICS: Subject
  INTEGRATED_MATH_ONE: ComputedSubject
  INTEGRATED_MATH_TWO: ComputedSubject
  INTEGRATED_MATH_THREE: ComputedSubject
  INTEGRATED_MATH_FOUR: ComputedSubject
}

export const MATH_SUBJECTS: MATH_SUBJECTS_TYPE = {
  PREALGEBRA: PREALGEBRA,
  ALGEBRA_ONE: ALGEBRA_ONE,
  ALGEBRA_TWO: ALGEBRA_TWO,
  GEOMETRY: GEOMETRY,
  TRIGONOMETRY: TRIGONOMETRY,
  PRECALCULUS: PRECALCULUS,
  CALCULUS_AB: CALCULUS_AB,
  CALCULUS_BC: CALCULUS_BC,
  STATISTICS: STATISTICS,
  INTEGRATED_MATH_ONE: INTEGRATED_MATH_ONE,
  INTEGRATED_MATH_TWO: INTEGRATED_MATH_TWO,
  INTEGRATED_MATH_THREE: INTEGRATED_MATH_THREE,
  INTEGRATED_MATH_FOUR: INTEGRATED_MATH_FOUR
}
