export const FORMAT_INTEGRATED_MATH = {
  integratedMathOne: 'Integrated Math 1',
  integratedMathTwo: 'Integrated Math 2',
  integratedMathThree: 'Integrated Math 3',
  integratedMathFour: 'Integrated Math 4',
}

export enum TRAINING {
  UPCHIEVE_101 = 'upchieve101',
  TUTORING_SKILLS = 'tutoringSkills',
  COLLEGE_COUNSELING = 'collegeCounseling',
  SAT_STRATEGIES = 'satStrategies',
  COLLEGE_SKILLS = 'collegeSkills',
}

export enum MATH_CERTS {
  // TODO: fix typo
  PREALGREBA = 'prealgebra',
  ALGEBRA_ONE = 'algebraOne',
  ALGEBRA_TWO = 'algebraTwo',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  CALCULUS_AB = 'calculusAB',
  CALCULUS_BC = 'calculusBC',
  STATISTICS = 'statistics',
}

export enum MATH_SUBJECTS {
  // TODO: fix typo
  PREALGREBA = 'prealgebra',
  ALGEBRA_ONE = 'algebraOne',
  ALGEBRA_TWO = 'algebraTwo',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  CALCULUS_AB = 'calculusAB',
  CALCULUS_BC = 'calculusBC',
  STATISTICS = 'statistics',
  INTEGRATED_MATH_ONE = 'integratedMathOne',
  INTEGRATED_MATH_TWO = 'integratedMathTwo',
  INTEGRATED_MATH_THREE = 'integratedMathThree',
  INTEGRATED_MATH_FOUR = 'integratedMathFour',
}

export enum SCIENCE_CERTS {
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne',
  PHYSICS_TWO = 'physicsTwo',
  ENVIRONMENTAL_SCIENCE = 'environmentalScience',
}
export enum SCIENCE_SUBJECTS {
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne',
  PHYSICS_TWO = 'physicsTwo',
  ENVIRONMENTAL_SCIENCE = 'environmentalScience',
}

export enum COLLEGE_CERTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUITMENT_PLANNING = 'sportsRecruitmentPlanning',
  PLANNING = 'planning',
  APPLICATIONS = 'applications',
  COLLEGE_APPS = 'collegeApps',
  COLLEGE_PREP = 'collegePrep',
  COLLEGE_LIST = 'collegeList',
  APPLICATION_ESSAYS = 'applicationEssays',
}

export enum COLLEGE_SUBJECTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUITMENT_PLANNING = 'sportsRecruitmentPlanning',
  PLANNING = 'planning',
  APPLICATIONS = 'applications',
  COLLEGE_APPS = 'collegeApps',
  COLLEGE_PREP = 'collegePrep',
  COLLEGE_LIST = 'collegeList',
  APPLICATION_ESSAYS = 'applicationEssays',
}

export enum SAT_CERTS {
  SAT_MATH = 'satMath',
  SAT_READING = 'satReading',
}

export enum SAT_SUBJECTS {
  SAT_MATH = 'satMath',
  SAT_READING = 'satReading',
}

export enum READING_WRITING_CERTS {
  HUMANITIES_ESSAYS = 'humanitiesEssays',
  READING = 'reading',
  ESSAY_PLANNING = 'essayPlanning',
  ESSAY_FEEDBACK = 'essayFeedback',
}

export enum READING_WRITING_SUBJECTS {
  HUMANITIES_ESSAYS = 'humanitiesEssays',
  READING = 'reading',
  ESSAY_PLANNING = 'essayPlanning',
  ESSAY_FEEDBACK = 'essayFeedback',
}

export enum SOCIAL_STUDIES_CERTS {
  US_HISTORY = 'usHistory',
}

export enum SOCIAL_STUDIES_SUBJECTS {
  US_HISTORY = 'usHistory',
}

export const SUBJECTS = {
  ...MATH_SUBJECTS,
  ...SCIENCE_SUBJECTS,
  ...COLLEGE_SUBJECTS,
  ...SAT_SUBJECTS,
  ...READING_WRITING_SUBJECTS,
  ...SOCIAL_STUDIES_SUBJECTS,
}

export const CERTS = {
  ...MATH_CERTS,
  ...SCIENCE_CERTS,
  ...COLLEGE_CERTS,
  ...SAT_CERTS,
  ...READING_WRITING_CERTS,
  ...SOCIAL_STUDIES_CERTS,
  ...TRAINING,
}

export const CERT_UNLOCKING = {
  [MATH_CERTS.CALCULUS_BC]: [
    MATH_SUBJECTS.CALCULUS_BC,
    MATH_SUBJECTS.CALCULUS_AB,
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA,
  ],
  [MATH_CERTS.CALCULUS_AB]: [
    MATH_SUBJECTS.CALCULUS_AB,
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA,
  ],
  [MATH_CERTS.PRECALCULUS]: [
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA,
  ],
  [MATH_CERTS.TRIGONOMETRY]: [MATH_SUBJECTS.TRIGONOMETRY],
  [MATH_CERTS.ALGEBRA_ONE]: [
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.PREALGREBA,
  ],
  [MATH_CERTS.ALGEBRA_TWO]: [
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.PREALGREBA,
  ],
  [MATH_CERTS.PREALGREBA]: [MATH_SUBJECTS.PREALGREBA],
  [MATH_CERTS.STATISTICS]: [MATH_SUBJECTS.STATISTICS],
  [MATH_CERTS.GEOMETRY]: [MATH_SUBJECTS.GEOMETRY],
  [SCIENCE_CERTS.BIOLOGY]: [SCIENCE_SUBJECTS.BIOLOGY],
  [SCIENCE_CERTS.CHEMISTRY]: [SCIENCE_SUBJECTS.CHEMISTRY],
  [SCIENCE_CERTS.PHYSICS_ONE]: [SCIENCE_SUBJECTS.PHYSICS_ONE],
  [SCIENCE_CERTS.PHYSICS_TWO]: [SCIENCE_SUBJECTS.PHYSICS_TWO],
  [SCIENCE_CERTS.ENVIRONMENTAL_SCIENCE]: [
    SCIENCE_SUBJECTS.ENVIRONMENTAL_SCIENCE,
  ],
  [SOCIAL_STUDIES_CERTS.US_HISTORY]: [SOCIAL_STUDIES_SUBJECTS.US_HISTORY],
  [COLLEGE_CERTS.ESSAYS]: [COLLEGE_SUBJECTS.ESSAYS],
  // @note: move applications and planning to computed certs once College Counseling is added
  [COLLEGE_CERTS.APPLICATIONS]: [COLLEGE_SUBJECTS.APPLICATIONS],
  [COLLEGE_CERTS.PLANNING]: [COLLEGE_SUBJECTS.PLANNING],
  [COLLEGE_CERTS.FINANCIAL_AID]: [COLLEGE_SUBJECTS.FINANCIAL_AID],
  [COLLEGE_CERTS.COLLEGE_APPS]: [COLLEGE_SUBJECTS.COLLEGE_APPS],
  [COLLEGE_CERTS.COLLEGE_LIST]: [COLLEGE_SUBJECTS.COLLEGE_LIST],
  [COLLEGE_CERTS.COLLEGE_PREP]: [COLLEGE_SUBJECTS.COLLEGE_PREP],
  [COLLEGE_CERTS.APPLICATION_ESSAYS]: [COLLEGE_SUBJECTS.APPLICATION_ESSAYS],
  [COLLEGE_CERTS.SPORTS_RECRUITMENT_PLANNING]: [
    COLLEGE_SUBJECTS.SPORTS_RECRUITMENT_PLANNING,
  ],
  [SAT_CERTS.SAT_MATH]: [SAT_CERTS.SAT_MATH],
  [SAT_CERTS.SAT_READING]: [SAT_CERTS.SAT_READING],
  [TRAINING.COLLEGE_COUNSELING]: [SUBJECTS.PLANNING, SUBJECTS.APPLICATIONS],
  [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: [
    READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS,
  ],
  [READING_WRITING_CERTS.READING]: [READING_WRITING_SUBJECTS.READING],
  [READING_WRITING_CERTS.ESSAY_PLANNING]: [
    READING_WRITING_SUBJECTS.ESSAY_PLANNING,
  ],
  [READING_WRITING_CERTS.ESSAY_FEEDBACK]: [
    READING_WRITING_SUBJECTS.ESSAY_FEEDBACK,
  ],
}

export const COMPUTED_CERTS = {
  [SUBJECTS.INTEGRATED_MATH_ONE]: [
    SUBJECTS.ALGEBRA_ONE,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS,
  ],
  [SUBJECTS.INTEGRATED_MATH_TWO]: [
    SUBJECTS.ALGEBRA_ONE,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS,
    MATH_CERTS.TRIGONOMETRY,
  ],
  [SUBJECTS.INTEGRATED_MATH_THREE]: [
    MATH_CERTS.PRECALCULUS,
    MATH_CERTS.STATISTICS,
  ],
  [SUBJECTS.INTEGRATED_MATH_FOUR]: [MATH_CERTS.PRECALCULUS],
  // @note: temporarily hide these computed certs for when the college counseling course is added
  // [SUBJECTS.PLANNING]: [TRAINING.COLLEGE_COUNSELING],
  // [SUBJECTS.APPLICATIONS]: [TRAINING.COLLEGE_COUNSELING]
}

export enum SUBJECT_TYPES {
  MATH = 'math',
  SCIENCE = 'science',
  COLLEGE = 'college',
  SAT = 'sat',
  TRAINING = 'training',
  READING_WRITING = 'readingWriting',
  SOCIAL_STUDIES = 'socialStudies',
}

export type ACTIVE_COLLEGE_CERTS = Exclude<
  COLLEGE_CERTS,
  'sportsRecruitmentPlanning' | 'financialAid'
>

export type ACTIVE_TRAINING_CERTS = Exclude<
  TRAINING,
  'tutoringSkills' | 'collegeCounseling' | 'satStrategies' | 'collegeSkills'
>

export type ACTIVE_QUIZ_CATEGORIES =
  | MATH_CERTS
  | SCIENCE_CERTS
  | ACTIVE_COLLEGE_CERTS
  | SAT_CERTS
  | READING_WRITING_CERTS
  | ACTIVE_TRAINING_CERTS
  | SOCIAL_STUDIES_CERTS

export const FORMAT_SUBJECT_TO_DISPLAY_NAME = {
  [MATH_SUBJECTS.ALGEBRA_ONE]: 'Algebra 1',
  [MATH_SUBJECTS.ALGEBRA_TWO]: 'Algebra 2',
  [MATH_SUBJECTS.CALCULUS_BC]: 'Calculus BC',
  [MATH_SUBJECTS.CALCULUS_AB]: 'Calculus AB',
  [MATH_SUBJECTS.INTEGRATED_MATH_ONE]: 'Integrated Math 1',
  [MATH_SUBJECTS.INTEGRATED_MATH_TWO]: 'Integrated Math 2',
  [MATH_SUBJECTS.INTEGRATED_MATH_THREE]: 'Integrated Math 3',
  [MATH_SUBJECTS.INTEGRATED_MATH_FOUR]: 'Integrated Math 4',
  [SCIENCE_SUBJECTS.PHYSICS_ONE]: 'Physics 1',
  [COLLEGE_SUBJECTS.ESSAYS]: 'College Essays',
  [SAT_SUBJECTS.SAT_MATH]: 'SAT Math',
  [SAT_SUBJECTS.SAT_READING]: 'SAT Reading',
  [READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS]: 'Humanities Essays',
  [READING_WRITING_SUBJECTS.READING]: 'Reading',
  [READING_WRITING_SUBJECTS.ESSAY_PLANNING]: 'Essay Planning',
  [READING_WRITING_SUBJECTS.ESSAY_FEEDBACK]: 'Essay Feedback',
}

// TODO: This is taken directly as is from the front-end. We will refactor this as we move towards hydrating subjects and training from the database
export const topics = {
  math: {
    subtopics: {
      prealgebra: { displayName: 'Pre-algebra' },
      algebraOne: { displayName: 'Algebra 1' },
      algebraTwo: { displayName: 'Algebra 2' },
      geometry: { displayName: 'Geometry' },
      trigonometry: { displayName: 'Trigonometry' },
      statistics: { displayName: 'Statistics' },
      precalculus: { displayName: 'Precalculus' },
      calculusAB: { displayName: 'Calculus AB' },
      calculusBC: { displayName: 'Calculus BC' },
      integratedMathOne: { displayName: 'Integrated Math 1' },
      integratedMathTwo: { displayName: 'Integrated Math 2' },
      integratedMathThree: { displayName: 'Integrated Math 3' },
      integratedMathFour: { displayName: 'Integrated Math 4' },
    },
    displayName: 'Math Tutoring',
  },
  science: {
    subtopics: {
      biology: { displayName: 'Biology' },
      chemistry: { displayName: 'Chemistry' },
      physicsOne: { displayName: 'Physics 1' },
      physicsTwo: { displayName: 'Physics 2' },
      environmentalScience: { displayName: 'Environmental Science' },
    },
    displayName: 'Science Tutoring',
  },
  readingWriting: {
    subtopics: {
      humanitiesEssays: { displayName: 'Humanities Essays' },
      reading: { displayName: 'Reading' },
      essayPlanning: { displayName: 'Essay Planning' },
      essayFeedback: { displayName: 'Essay Feedback' },
    },
    displayName: 'English Tutoring',
  },
  socialStudies: {
    subtopics: {
      usHistory: { displayName: 'U.S. History' },
    },
    displayName: 'Social Studies',
  },
  college: {
    subtopics: {
      planning: { displayName: 'Planning' },
      essays: { displayName: 'College Essays' },
      applications: { displayName: 'Applications' },
      collegePrep: { displayName: 'College Prep' },
      collegeList: { displayName: 'College List' },
      collegeApps: { displayName: 'Applications' },
      applicationEssays: { displayName: 'Application Essays' },
      financialAid: { displayName: 'Financial Aid' },
    },
    displayName: 'College Advising',
  },
  sat: {
    subtopics: {
      satMath: { displayName: 'SAT Math' },
      satReading: { displayName: 'SAT Reading' },
    },
    displayName: 'Standardized Testing Tutoring',
  },
  training: {
    subtopics: {
      upchieve101: { displayName: 'UPchieve 101' },
    },
    displayName: 'UPchieve Training',
  },
}

// TODO: This is taken directly as is from the front-end. We will refactor this as we move towards hydrating subjects and training from the database
export const trainingView = {
  subjectTypes: [
    { displayName: 'Math', key: 'math' },
    { displayName: 'Science', key: 'science' },
    { displayName: 'English', key: 'readingWriting' },
    { displayName: 'Social Studies', key: 'socialStudies' },
    { displayName: 'College Advising', key: 'college' },
    { displayName: 'Standardized Testing', key: 'sat' },
  ],
  math: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'Pre-algebra',
        subjectsIncluded: [{ displayName: 'Pre-algebra', key: 'prealgebra' }],
        key: 'prealgebra',
      },
      {
        displayName: 'Algebra 1',
        subjectsIncluded: [
          { displayName: 'Pre-algebra', key: 'prealgebra' },
          { displayName: 'Algebra 1', key: 'algebraOne' },
        ],
        key: 'algebraOne',
      },
      {
        displayName: 'Algebra 2',
        subjectsIncluded: [
          { displayName: 'Pre-algebra', key: 'prealgebra' },
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Algebra 2', key: 'algebraTwo' },
        ],
        key: 'algebraTwo',
      },
      {
        displayName: 'Geometry',
        subjectsIncluded: [{ displayName: 'Geometry', key: 'geometry' }],
        key: 'geometry',
      },
      {
        displayName: 'Trigonometry',
        subjectsIncluded: [
          { displayName: 'Trigonometry', key: 'trigonometry' },
        ],
        key: 'trigonometry',
      },
      {
        displayName: 'Statistics',
        subjectsIncluded: [{ displayName: 'Statistics', key: 'statistics' }],
        key: 'statistics',
      },
      {
        displayName: 'Precalculus',
        subjectsIncluded: [
          { displayName: 'Pre-algebra', key: 'prealgebra' },
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Algebra 2', key: 'algebraTwo' },
          { displayName: 'Trigonometry', key: 'trigonometry' },
          { displayName: 'Precalculus', key: 'precalculus' },
        ],
        key: 'precalculus',
      },
      {
        displayName: 'Calculus AB',
        subjectsIncluded: [
          { displayName: 'Pre-algebra', key: 'prealgebra' },
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Algebra 2', key: 'algebraTwo' },
          { displayName: 'Trigonometry', key: 'trigonometry' },
          { displayName: 'Precalculus', key: 'precalculus' },
          { displayName: 'Calculus AB', key: 'calculusAB' },
        ],
        key: 'calculusAB',
      },
      {
        displayName: 'Calculus BC',
        subjectsIncluded: [
          { displayName: 'Pre-algebra', key: 'prealgebra' },
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Algebra 2', key: 'algebraTwo' },
          { displayName: 'Trigonometry', key: 'trigonometry' },
          { displayName: 'Precalculus', key: 'precalculus' },
          { displayName: 'Calculus AB', key: 'calculusAB' },
          { displayName: 'Calculus BC', key: 'calculusBC' },
        ],
        key: 'calculusBC',
      },
    ],
    additionalSubjects: [
      {
        displayName: 'Integrated Math 1',
        subjectsIncluded: [
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Geometry', key: 'geometry' },
          { displayName: 'Statistics', key: 'statistics' },
        ],
        key: 'integratedMathOne',
      },
      {
        displayName: 'Integrated Math 2',
        subjectsIncluded: [
          { displayName: 'Algebra 1', key: 'algebraOne' },
          { displayName: 'Geometry', key: 'geometry' },
          { displayName: 'Trigonometry', key: 'trigonometry' },
          { displayName: 'Statistics', key: 'statistics' },
        ],
        key: 'integratedMathTwo',
      },
      {
        displayName: 'Integrated Math 3',
        subjectsIncluded: [
          { displayName: 'Precalculus', key: 'precalculus' },
          { displayName: 'Statistics', key: 'statistics' },
        ],
        key: 'integratedMathThree',
      },
      {
        displayName: 'Integrated Math 4',
        subjectsIncluded: [{ displayName: 'Precalculus', key: 'precalculus' }],

        key: 'integratedMathFour',
      },
    ],
  },
  science: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'Biology',
        subjectsIncluded: [{ displayName: 'Biology', key: 'biology' }],
        key: 'biology',
      },
      {
        displayName: 'Chemistry',
        subjectsIncluded: [{ displayName: 'Chemistry', key: 'chemistry' }],
        key: 'chemistry',
      },
      {
        displayName: 'Physics 1',
        subjectsIncluded: [{ displayName: 'Physics 1', key: 'physicsOne' }],
        key: 'physicsOne',
      },
      {
        displayName: 'Physics 2',
        subjectsIncluded: [{ displayName: 'Physics 2', key: 'physicsTwo' }],
        key: 'physicsTwo',
      },
      {
        displayName: 'Environmental Science',
        subjectsIncluded: [
          {
            displayName: 'Environmental Science',
            key: 'environmentalScience',
          },
        ],
        key: 'environmentalScience',
      },
    ],
    additionalSubjects: [],
  },
  readingWriting: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'Humanities Essays',
        subjectsIncluded: [
          {
            displayName: 'Humanities Essays',
            key: 'humanitiesEssays',
          },
        ],
        key: 'humanitiesEssays',
      },
      {
        displayName: 'Reading',
        subjectsIncluded: [
          {
            displayName: 'Reading',
            key: 'reading',
          },
        ],
        key: 'reading',
      },
      {
        displayName: 'Essay Planning',
        subjectsIncluded: [
          {
            displayName: 'Essay Planning',
            key: 'essayPlanning',
          },
        ],
        key: 'essayPlanning',
      },
      {
        displayName: 'Essay Feedback',
        subjectsIncluded: [
          {
            displayName: 'Essay Feedback',
            key: 'essayFeedback',
          },
        ],
        key: 'essayFeedback',
      },
    ],
    additionalSubjects: [],
  },
  socialStudies: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'U.S. History',
        subjectsIncluded: [
          {
            displayName: 'U.S. History',
            key: 'usHistory',
          },
        ],
        key: 'usHistory',
      },
    ],
    additionalSubjects: [],
  },
  college: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'College Essays',
        subjectsIncluded: [{ displayName: 'College Essays', key: 'essays' }],
        key: 'essays',
      },
      {
        displayName: 'Planning',
        subjectsIncluded: [{ displayName: 'Planning', key: 'planning' }],
        key: 'planning',
      },
      {
        displayName: 'Applications',
        subjectsIncluded: [
          { displayName: 'Applications', key: 'applications' },
        ],
        key: 'applications',
      },
      {
        displayName: 'College Prep',
        subjectsIncluded: [{ displayName: 'College Prep', key: 'collegePrep' }],
        key: 'collegePrep',
      },
      {
        displayName: 'College List',
        subjectsIncluded: [{ displayName: 'College List', key: 'collegeList' }],
        key: 'collegeList',
      },
      {
        displayName: 'Applications',
        subjectsIncluded: [{ displayName: 'Applications', key: 'collegeApps' }],
        key: 'collegeApps',
      },
      {
        displayName: 'Application Essays',
        subjectsIncluded: [
          { displayName: 'Application Essays', key: 'applicationEssays' },
        ],
        key: 'applicationEssays',
      },
      {
        displayName: 'Financial Aid',
        subjectsIncluded: [
          { displayName: 'Financial Aid', key: 'financialAid' },
        ],
        key: 'financialAid',
      },
    ],
    additionalSubjects: [],
  },
  sat: {
    training: [{ displayName: 'UPchieve 101', key: 'upchieve101' }],
    certifications: [
      {
        displayName: 'SAT Math',
        subjectsIncluded: [{ displayName: 'SAT Math', key: 'satMath' }],
        key: 'satMath',
      },
      {
        displayName: 'SAT Reading',
        subjectsIncluded: [{ displayName: 'SAT Reading', key: 'satReading' }],
        key: 'satReading',
      },
    ],
    additionalSubjects: [],
  },
}
