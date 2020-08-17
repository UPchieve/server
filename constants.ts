export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const UTC_TO_HOUR_MAPPING = {
  0: '12a',
  1: '1a',
  2: '2a',
  3: '3a',
  4: '4a',
  5: '5a',
  6: '6a',
  7: '7a',
  8: '8a',
  9: '9a',
  10: '10a',
  11: '11a',
  12: '12p',
  13: '1p',
  14: '2p',
  15: '3p',
  16: '4p',
  17: '5p',
  18: '6p',
  19: '7p',
  20: '8p',
  21: '9p',
  22: '10p',
  23: '11p'
};

export const USER_ACTION = {
  TYPE: {
    QUIZ: 'QUIZ',
    SESSION: 'SESSION',
    ACCOUNT: 'ACCOUNT'
  },
  QUIZ: {
    STARTED: 'STARTED QUIZ',
    PASSED: 'PASSED QUIZ',
    FAILED: 'FAILED QUIZ',
    VIEWED_MATERIALS: 'VIEWED REVIEW MATERIALS'
  },
  SESSION: {
    REQUESTED: 'REQUESTED SESSION',
    JOINED: 'JOINED SESSION',
    REJOINED: 'REJOINED SESSION',
    ENDED: 'ENDED SESSION',
    REPLIED_YES: 'REPLIED YES TO TEXT'
  },
  ACCOUNT: {
    CREATED: 'CREATED',
    UPDATED_AVAILABILITY: 'UPDATED AVAILABILITY',
    UPDATED_PROFILE: 'UPDATED PROFILE',
    ADDED_PHOTO_ID: 'ADDED PHOTO ID',
    ADDED_REFERENCE: 'ADDED REFERENCE',
    COMPLETED_BACKGROUND_INFO: 'COMPLETED BACKGROUND INFORMATION',
    DELETED_REFERENCE: 'DELETED REFERENCE',
    APPROVED: 'APPROVED',
    ONBOARDED: 'ONBOARDED',
    SUBMITTED_REFERENCE_FORM: 'SUBMITTED REFERENCE FORM',
    REJECTED_PHOTO_ID: 'REJECTED PHOTO ID',
    REJECTED_REFERENCE: 'REJECTED REFERENCE'
  }
};

export const USER_BAN_REASON = {
  NON_US_SIGNUP: 'NON US SIGNUP',
  BANNED_IP: 'USED BANNED IP',
  SESSION_REPORTED: 'SESSION REPORTED',
  BANNED_SERVICE_PROVIDER: 'BANNED SERVICE PROVIDER'
};

export enum IP_ADDRESS_STATUS {
  OK = 'OK',
  BANNED = 'BANNED'
}

export const INTEGRATED_MATH_MAPPING = {
  integratedmathone: 'integratedMathOne',
  integratedmathtwo: 'integratedMathTwo',
  integratedmaththree: 'integratedMathThree',
  integratedmathfour: 'integratedMathFour'
};

export const FORMAT_INTEGRATED_MATH = {
  integratedMathOne: 'Integrated Math 1',
  integratedMathTwo: 'Integrated Math 2',
  integratedMathThree: 'Integrated Math 3',
  integratedMathFour: 'Integrated Math 4'
};

export const PHYSICS_MAPPING = {
  physicsone: 'physicsOne'
};

export const FORMAT_PHYSICS = {
  physicsOne: 'Physics 1'
};

export const STATUS = {
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED'
};

export const PHOTO_ID_STATUS = {
  EMPTY: 'EMPTY',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
};

export const REFERENCE_STATUS = {
  UNSENT: 'UNSENT',
  SENT: 'SENT',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
};

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'Student was rude',
  STUDENT_MISUSE: 'Student was misusing platform'
};

export enum REQUIRED_TRAINING {
  TUTORING_SKILLS = 'tutoringSkills',
  COLLEGE_COUNSELING = 'collegeCounseling'
}

export enum MATH_CERTS {
  PREALGREBA = 'prealgebra',
  ALGEBRA = 'algebra',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  // CALCULUS = 'calculus',
  CALCULUS_AB = 'calculusAB',
  CALCULUS_BC = 'calculusBC',
  STATISTICS = 'statistics'
}

export enum SCIENCE_CERTS {
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne',
  PHYSICS_TWO = 'physicsTwo',
  ENVIRONMENTAL_SCIENCE = 'environmentalScience'
}

export enum COLLEGE_CERTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUIMENT_PLANNING = 'sportsRecruitmentPlanning'
}

export enum STANDARDIZED_TESTING_CERTS {
  SAT_MATH = 'satMath',
  SAT_READING = 'satReading'
}

export enum SUBJECTS {
  PREALGREBA = 'prealgebra',
  ALGEBRA = 'algebra',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  // CALCULUS = 'calculus',
  CALCULUS_AB = 'calculusAB',
  CALCULUS_BC = 'calculusBC',
  INTEGRATED_MATH_ONE = 'integratedMathOne',
  INTEGRATED_MATH_TWO = 'integratedMathTwo',
  INTEGRATED_MATH_THREE = 'integratedMathThree',
  INTEGRATED_MATH_FOUR = 'integratedMathFour',
  STATISTICS = 'statistics',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne',
  PHYSICS_TWO = 'physicsTwo',
  ENVIRONMENTAL_SCIENCE = 'environmentalScience',
  PLANNING = 'planning',
  APPLICATIONS = 'applications',
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUIMENT_PLANNING = 'sportsRecruitmentPlanning',
  SAT_MATH = 'satMath',
  SAT_READING = 'satReading'
}

export const CERT_UNLOCKING = {
  [SUBJECTS.CALCULUS_BC]: [
    SUBJECTS.CALCULUS_BC,
    SUBJECTS.CALCULUS_AB,
    SUBJECTS.PRECALCULUS,
    SUBJECTS.TRIGONOMETRY,
    SUBJECTS.ALGEBRA,
    SUBJECTS.PREALGREBA
  ],
  [SUBJECTS.CALCULUS_AB]: [
    SUBJECTS.CALCULUS_AB,
    SUBJECTS.PRECALCULUS,
    SUBJECTS.TRIGONOMETRY,
    SUBJECTS.ALGEBRA,
    SUBJECTS.PREALGREBA
  ],
  [SUBJECTS.PRECALCULUS]: [
    SUBJECTS.PRECALCULUS,
    SUBJECTS.TRIGONOMETRY,
    SUBJECTS.ALGEBRA,
    SUBJECTS.PREALGREBA
  ],
  [SUBJECTS.TRIGONOMETRY]: [SUBJECTS.TRIGONOMETRY],
  [SUBJECTS.ALGEBRA]: [SUBJECTS.ALGEBRA, SUBJECTS.PREALGREBA],
  [SUBJECTS.PREALGREBA]: [SUBJECTS.PREALGREBA],
  [SUBJECTS.STATISTICS]: [SUBJECTS.STATISTICS],
  [SUBJECTS.GEOMETRY]: [SUBJECTS.GEOMETRY],
  [SUBJECTS.BIOLOGY]: [SUBJECTS.BIOLOGY],
  [SUBJECTS.CHEMISTRY]: [SUBJECTS.CHEMISTRY],
  [SUBJECTS.PHYSICS_ONE]: [SUBJECTS.PHYSICS_ONE],
  [SUBJECTS.PHYSICS_TWO]: [SUBJECTS.PHYSICS_TWO],
  [SUBJECTS.ENVIRONMENTAL_SCIENCE]: [SUBJECTS.ENVIRONMENTAL_SCIENCE],
  [SUBJECTS.ESSAYS]: [SUBJECTS.ESSAYS],
  [SUBJECTS.FINANCIAL_AID]: [SUBJECTS.FINANCIAL_AID],
  [SUBJECTS.SPORTS_RECRUIMENT_PLANNING]: [SUBJECTS.SPORTS_RECRUIMENT_PLANNING],
  [SUBJECTS.SAT_MATH]: [SUBJECTS.SAT_MATH],
  [SUBJECTS.SAT_READING]: [SUBJECTS.SAT_READING],
  [REQUIRED_TRAINING.COLLEGE_COUNSELING]: [
    SUBJECTS.PLANNING,
    SUBJECTS.APPLICATIONS
  ]
};

export const COMPUTED_CERTS = {
  [SUBJECTS.INTEGRATED_MATH_ONE]: [
    SUBJECTS.ALGEBRA,
    SUBJECTS.GEOMETRY,
    SUBJECTS.STATISTICS
  ],
  [SUBJECTS.INTEGRATED_MATH_TWO]: [
    SUBJECTS.ALGEBRA,
    SUBJECTS.GEOMETRY,
    SUBJECTS.STATISTICS,
    SUBJECTS.TRIGONOMETRY
  ],
  [SUBJECTS.INTEGRATED_MATH_THREE]: [SUBJECTS.PRECALCULUS, SUBJECTS.STATISTICS],
  [SUBJECTS.INTEGRATED_MATH_FOUR]: [SUBJECTS.PRECALCULUS],
  // Calculus AB, Calculus BC, or Precalculus can also unlock SAT Math
  [SUBJECTS.SAT_MATH]: [
    SUBJECTS.ALGEBRA,
    SUBJECTS.TRIGONOMETRY,
    SUBJECTS.GEOMETRY
  ],
  [SUBJECTS.PLANNING]: [REQUIRED_TRAINING.COLLEGE_COUNSELING],
  [SUBJECTS.APPLICATIONS]: [REQUIRED_TRAINING.COLLEGE_COUNSELING]
};
