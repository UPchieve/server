export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

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
}

export const HOUR_TO_UTC_MAPPING = {
  '12a': 0,
  '1a': 1,
  '2a': 2,
  '3a': 3,
  '4a': 4,
  '5a': 5,
  '6a': 6,
  '7a': 7,
  '8a': 8,
  '9a': 9,
  '10a': 10,
  '11a': 11,
  '12p': 12,
  '1p': 13,
  '2p': 14,
  '3p': 15,
  '4p': 16,
  '5p': 17,
  '6p': 18,
  '7p': 19,
  '8p': 20,
  '9p': 21,
  '10p': 22,
  '11p': 23
}

export const USER_ACTION = {
  TYPE: {
    QUIZ: 'QUIZ',
    SESSION: 'SESSION',
    ACCOUNT: 'ACCOUNT',
    ADMIN: 'ADMIN'
  },
  QUIZ: {
    STARTED: 'STARTED QUIZ',
    PASSED: 'PASSED QUIZ',
    FAILED: 'FAILED QUIZ',
    VIEWED_MATERIALS: 'VIEWED REVIEW MATERIALS',
    UNLOCKED_SUBJECT: 'UNLOCKED SUBJECT'
  },
  SESSION: {
    REQUESTED: 'REQUESTED SESSION',
    JOINED: 'JOINED SESSION',
    REJOINED: 'REJOINED SESSION',
    ENDED: 'ENDED SESSION',
    REPLIED_YES: 'REPLIED YES TO TEXT',
    TIMED_OUT_15_MINS: '15 MIN TIME OUT',
    TIMED_OUT_45_MINS: '45 MIN TIME OUT'
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
    REJECTED_REFERENCE: 'REJECTED REFERENCE',
    BANNED: 'BANNED',
    DEACTIVATED: 'DEACTIVATED'
  }
}

// new format to move to from USER_ACTIONS
// user events in a [noun][verb] format
export const EVENTS = {
  ACCOUNT_APPROVED: 'ACCOUNT_APPROVED',
  ACCOUNT_ONBOARDED: 'ACCOUNT_ONBOARDED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  FRIEND_REFERRED: 'FRIEND_REFERRED',
  PHOTO_ID_REJECTED: 'PHOTO_ID_REJECTED',
  REFERENCE_DELETED: 'REFERENCE_DELETED',
  REFERENCE_REJECTED: 'REFERENCE_REJECTED',
  SESSION_JOINED: 'SESSION_JOINED',
  SESSION_MATCHED: 'SESSION_MATCHED',
  SESSION_REJOINED: 'SESSION_REJOINED',
  SUBJECT_UNLOCKED: 'SUBJECT_UNLOCKED',
  SESSION_REPLIED_YES_TO_TEXT: 'SESSION_REPLIED_YES_TO_TEXT' // @note: currently deprecated
}

export enum USER_BAN_REASON {
  NON_US_SIGNUP = 'NON US SIGNUP',
  BANNED_IP = 'USED BANNED IP',
  SESSION_REPORTED = 'SESSION REPORTED',
  BANNED_SERVICE_PROVIDER = 'BANNED SERVICE PROVIDER',
  ADMIN = 'ADMIN'
}

export enum IP_ADDRESS_STATUS {
  OK = 'OK',
  BANNED = 'BANNED'
}

export const INTEGRATED_MATH_MAPPING = {
  integratedmathone: 'integratedMathOne',
  integratedmathtwo: 'integratedMathTwo',
  integratedmaththree: 'integratedMathThree',
  integratedmathfour: 'integratedMathFour'
}

export const FORMAT_INTEGRATED_MATH = {
  integratedMathOne: 'Integrated Math 1',
  integratedMathTwo: 'Integrated Math 2',
  integratedMathThree: 'Integrated Math 3',
  integratedMathFour: 'Integrated Math 4'
}

export const PHYSICS_MAPPING = {
  physicsone: 'physicsOne'
}

export const FORMAT_PHYSICS = {
  physicsOne: 'Physics 1'
}

export const STATUS = {
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED'
}

export const PHOTO_ID_STATUS = {
  EMPTY: 'EMPTY',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
}

export const REFERENCE_STATUS = {
  UNSENT: 'UNSENT',
  SENT: 'SENT',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
}

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'Student was rude',
  STUDENT_MISUSE: 'Student was misusing platform'
}

export enum TRAINING {
  UPCHIEVE_101 = 'upchieve101',
  TUTORING_SKILLS = 'tutoringSkills',
  COLLEGE_COUNSELING = 'collegeCounseling',
  SAT_STRATEGIES = 'satStrategies',
  COLLEGE_SKILLS = 'collegeSkills'
}

export enum MATH_CERTS {
  PREALGREBA = 'prealgebra',
  ALGEBRA = 'algebra',
  GEOMETRY = 'geometry',
  TRIGONOMETRY = 'trigonometry',
  PRECALCULUS = 'precalculus',
  CALCULUS_AB = 'calculusAB',
  CALCULUS_BC = 'calculusBC',
  STATISTICS = 'statistics'
}

export const MATH_SUBJECTS = {
  PREALGREBA: 'prealgebra',
  ALGEBRA_ONE: 'algebraOne',
  ALGEBRA_TWO: 'algebraTwo',
  GEOMETRY: 'geometry',
  TRIGONOMETRY: 'trigonometry',
  PRECALCULUS: 'precalculus',
  CALCULUS_AB: 'calculusAB',
  CALCULUS_BC: 'calculusBC',
  STATISTICS: 'statistics',
  INTEGRATED_MATH_ONE: 'integratedMathOne',
  INTEGRATED_MATH_TWO: 'integratedMathTwo',
  INTEGRATED_MATH_THREE: 'integratedMathThree',
  INTEGRATED_MATH_FOUR: 'integratedMathFour'
}

export enum SCIENCE_CERTS {
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS_ONE = 'physicsOne',
  PHYSICS_TWO = 'physicsTwo',
  ENVIRONMENTAL_SCIENCE = 'environmentalScience'
}
export const SCIENCE_SUBJECTS = {
  BIOLOGY: 'biology',
  CHEMISTRY: 'chemistry',
  PHYSICS_ONE: 'physicsOne',
  PHYSICS_TWO: 'physicsTwo',
  ENVIRONMENTAL_SCIENCE: 'environmentalScience'
}

export enum COLLEGE_CERTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUITMENT_PLANNING = 'sportsRecruitmentPlanning',
  PLANNING = 'planning',
  APPLICATIONS = 'applications'
}

export enum COLLEGE_SUBJECTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUITMENT_PLANNING = 'sportsRecruitmentPlanning',
  PLANNING = 'planning',
  APPLICATIONS = 'applications'
}

export enum SAT_CERTS {
  SAT_MATH = 'satMath',
  SAT_READING = 'satReading'
}

export const SAT_SUBJECTS = {
  SAT_MATH: 'satMath',
  SAT_READING: 'satReading'
}

export enum READING_WRITING_CERTS {
  HUMANITIES_ESSAYS = 'humanitiesEssays'
}

export enum READING_WRITING_SUBJECTS {
  HUMANITIES_ESSAYS = 'humanitiesEssays'
}

export const SUBJECTS = {
  ...MATH_SUBJECTS,
  ...SCIENCE_SUBJECTS,
  ...COLLEGE_SUBJECTS,
  ...SAT_SUBJECTS,
  ...READING_WRITING_SUBJECTS
}

export const CERT_UNLOCKING = {
  [MATH_CERTS.CALCULUS_BC]: [
    MATH_SUBJECTS.CALCULUS_BC,
    MATH_SUBJECTS.CALCULUS_AB,
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA
  ],
  [MATH_CERTS.CALCULUS_AB]: [
    MATH_SUBJECTS.CALCULUS_AB,
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA
  ],
  [MATH_CERTS.PRECALCULUS]: [
    MATH_SUBJECTS.PRECALCULUS,
    MATH_SUBJECTS.TRIGONOMETRY,
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA
  ],
  [MATH_CERTS.TRIGONOMETRY]: [MATH_SUBJECTS.TRIGONOMETRY],
  [MATH_CERTS.ALGEBRA]: [
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA
  ],
  [MATH_CERTS.PREALGREBA]: [MATH_SUBJECTS.PREALGREBA],
  [MATH_CERTS.STATISTICS]: [MATH_SUBJECTS.STATISTICS],
  [MATH_CERTS.GEOMETRY]: [MATH_SUBJECTS.GEOMETRY],
  [SCIENCE_CERTS.BIOLOGY]: [SCIENCE_SUBJECTS.BIOLOGY],
  [SCIENCE_CERTS.CHEMISTRY]: [SCIENCE_SUBJECTS.CHEMISTRY],
  [SCIENCE_CERTS.PHYSICS_ONE]: [SCIENCE_SUBJECTS.PHYSICS_ONE],
  [SCIENCE_CERTS.PHYSICS_TWO]: [SCIENCE_SUBJECTS.PHYSICS_TWO],
  [SCIENCE_CERTS.ENVIRONMENTAL_SCIENCE]: [
    SCIENCE_SUBJECTS.ENVIRONMENTAL_SCIENCE
  ],
  [COLLEGE_CERTS.ESSAYS]: [COLLEGE_SUBJECTS.ESSAYS],
  // @note: move applications and planning to computed certs once College Counseling is added
  [COLLEGE_CERTS.APPLICATIONS]: [COLLEGE_SUBJECTS.APPLICATIONS],
  [COLLEGE_CERTS.PLANNING]: [COLLEGE_SUBJECTS.PLANNING],
  [COLLEGE_CERTS.FINANCIAL_AID]: [COLLEGE_SUBJECTS.FINANCIAL_AID],
  [COLLEGE_CERTS.SPORTS_RECRUITMENT_PLANNING]: [
    COLLEGE_SUBJECTS.SPORTS_RECRUITMENT_PLANNING
  ],
  [SAT_CERTS.SAT_MATH]: [SAT_CERTS.SAT_MATH],
  [SAT_CERTS.SAT_READING]: [SAT_CERTS.SAT_READING],
  [TRAINING.COLLEGE_COUNSELING]: [SUBJECTS.PLANNING, SUBJECTS.APPLICATIONS],
  [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: [
    READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS
  ]
}

export const COMPUTED_CERTS = {
  [SUBJECTS.INTEGRATED_MATH_ONE]: [
    // @note: Algebra unlocks both Algebra 1 and Algebra 2, either or can be used to compute Integrated Math
    SUBJECTS.ALGEBRA_ONE,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS
  ],
  [SUBJECTS.INTEGRATED_MATH_TWO]: [
    SUBJECTS.ALGEBRA_ONE,
    MATH_CERTS.GEOMETRY,
    MATH_CERTS.STATISTICS,
    MATH_CERTS.TRIGONOMETRY
  ],
  [SUBJECTS.INTEGRATED_MATH_THREE]: [
    MATH_CERTS.PRECALCULUS,
    MATH_CERTS.STATISTICS
  ],
  [SUBJECTS.INTEGRATED_MATH_FOUR]: [MATH_CERTS.PRECALCULUS]
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
  READING_WRITING = 'readingWriting'
}

export const CALCULUS_MAPPING = {
  calculusbc: MATH_SUBJECTS.CALCULUS_BC,
  calculusab: MATH_SUBJECTS.CALCULUS_AB
}

export const FORMAT_CALCULUS = {
  [MATH_SUBJECTS.CALCULUS_BC]: 'Calculus BC',
  [MATH_SUBJECTS.CALCULUS_AB]: 'Calculus AB'
}

export const ALGEBRA_MAPPING = {
  algebraone: MATH_SUBJECTS.ALGEBRA_ONE,
  algebratwo: MATH_SUBJECTS.ALGEBRA_TWO
}

export const FORMAT_ALGEBRA = {
  [MATH_SUBJECTS.ALGEBRA_ONE]: 'Algebra 1',
  [MATH_SUBJECTS.ALGEBRA_TWO]: 'Algebra 2'
}

export const SAT_MAPPING = {
  satmath: SAT_SUBJECTS.SAT_MATH,
  satreading: SAT_SUBJECTS.SAT_READING
}

export const FORMAT_SAT = {
  [SAT_SUBJECTS.SAT_MATH]: 'SAT Math',
  [SAT_SUBJECTS.SAT_READING]: 'SAT Reading'
}

export const FORMAT_READING_WRITING = {
  [READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS]: 'Humanities Essays'
}

export enum SURVEY_TYPES {
  STUDENT_PRESESSION = 'student pre-session',
  STUDENT_POSTSESSION = 'student post-session'
}

export enum SESSION_FLAGS {
  ABSENT_USER = 'ABSENT_USER',
  COMMENT = 'COMMENT',
  FIRST_TIME_VOLUNTEER = 'FIRST_TIME_VOLUNTEER',
  FIRST_TIME_STUDENT = 'FIRST_TIME_STUDENT',
  LOW_MESSAGES = 'LOW_MESSAGES',
  REPORTED = 'REPORTED',
  STUDENT_RATING = 'STUDENT_RATING',
  VOLUNTEER_RATING = 'VOLUNTEER_RATING',
  UNMATCHED = 'UNMATCHED'
}

// amount of volunteers to text notifications to per session
export const TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15

export enum VERIFICATION_METHOD {
  SMS = 'sms',
  EMAIL = 'email'
}

export enum FEEDBACK_VERSIONS {
  'ONE' = 1,
  'TWO'
}

export enum ONBOARDING_STATUS {
  ONBOARDED = 'Onboarded',
  DEACTIVATED = 'Deactivated',
  INACTIVE = 'Inactive',
  IN_PROGRESS = 'In progress',
  NOT_STARTED = 'Not started'
}

export const ONE_DAY_ELAPSED_MILLISECONDS = 1000 * 60 * 60 * 24

export const CATEGORY_TO_SUBCATEGORY_MAP = {
  [MATH_CERTS.PREALGREBA]: [
    'numbers',
    'arithmetic properties',
    'exponents',
    'exponents and radicals',
    'polynomials',
    'fractions'
  ],
  [MATH_CERTS.ALGEBRA]: [
    'linear equations',
    'rational exponents and radicals',
    'application of linear equations',
    'two variable equations',
    'rational expressions',
    'complex numbers'
  ],
  [MATH_CERTS.GEOMETRY]: [
    'congruence and similarity',
    'vertices',
    'angles',
    'circles',
    'triangles',
    'rectangles'
  ],
  [MATH_CERTS.TRIGONOMETRY]: [
    'angles',
    'triangles',
    'right triangles',
    'quadrants',
    'radians',
    'unit circle',
    'inequalities'
  ],
  [MATH_CERTS.STATISTICS]: [
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
  ],
  [MATH_CERTS.PRECALCULUS]: [
    'rectangular coordinates',
    'linear inequalities',
    'functions',
    'rational exponents',
    'quadratic functions',
    'logarithms and exponents'
  ],
  [MATH_CERTS.CALCULUS_AB]: [
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
  ],
  [MATH_CERTS.CALCULUS_BC]: [
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
  ],
  [COLLEGE_CERTS.ESSAYS]: [
    'basic',
    'commonapp',
    'answer',
    'dhistory',
    'optional',
    'supplemental'
  ],
  // @note: Once College Counseling is implemented Planning and Applications will be phased to subjects that are unlocked instead of certs
  [COLLEGE_CERTS.PLANNING]: ['exam', 'type', 'LOR', 'basic'],
  [COLLEGE_CERTS.APPLICATIONS]: [
    'timeline',
    'resume',
    'schools',
    'fees',
    'FinAid',
    'LOR',
    'basic'
  ],
  [SCIENCE_CERTS.BIOLOGY]: [
    'biochemistry',
    'the cell',
    'cell division',
    'cellular respiration',
    'photosynthesis and plants',
    'classical genetics',
    'molecular genetics',
    'animal behavior and physiology',
    'ecology',
    'human physiology and anatomy',
    'evolution and taxonomy'
  ],
  [SCIENCE_CERTS.CHEMISTRY]: [
    'chemical reactions',
    'atoms, compounds, and ions',
    'stoichiometry',
    'electron structure of atoms',
    'periodic table',
    'chemical bonds',
    'gases',
    'states of matter and intermolecular forces',
    'chemical equilibrium',
    'acids and bases',
    'buffers, titrations, and solubility equilibria',
    'thermodynamics',
    'redox reactions and electrochemistry',
    'kinetics',
    'nuclear chemistry',
    'kinematics'
  ],
  [SCIENCE_CERTS.PHYSICS_ONE]: [
    'kinematics',
    // eslint-disable-next-line quotes
    "newton's laws",
    'rotational mechanics',
    'work and energy',
    'momentum and collisions',
    'thermodynamics',
    'electrostatics',
    'magnetism',
    'waves and sound',
    'refraction and reflection',
    'gravity/gen relativity'
  ],
  [SCIENCE_CERTS.PHYSICS_TWO]: [
    'Fluids - density and pressure',
    'Fluids - dynamics',
    'THD - Ideal Gases',
    'thermodynamics',
    'Electric Field',
    'Electric Potential',
    'Magnetic Fields',
    'Magnetic Induction',
    'Electromagnetic Waves',
    'Optics - refraction and reflection',
    'Quantum & Atomic Physics',
    'dynamics 2',
    'Electric Circuits'
  ],
  [SCIENCE_CERTS.ENVIRONMENTAL_SCIENCE]: [
    'earth systems and resources',
    'ecology',
    'energy resources and consumption',
    'global change',
    'impact of human health and environment',
    'interdependence of organisms',
    'land and water resources and use',
    'introduction to environmental science',
    'natural biogeochemical cycles',
    'pollution',
    'populations',
    'the atmosphere'
  ],
  [TRAINING.UPCHIEVE_101]: ['upchieve'],
  [SAT_CERTS.SAT_MATH]: [
    'linear_equations',
    'linear_inequalities',
    'linear_functions',
    'quadratic_problems',
    'nonlinear_equations',
    'rational_expressions',
    'isolating_quantities',
    'linear_systems',
    'ratios_rates',
    'units',
    'percentages',
    'linear_and_exponential',
    'data_inferences',
    'volume_word_problems',
    'complex_numbers',
    'circle_equations',
    'table_data',
    'scatterplots',
    'graphs',
    'shape_of_distributions',
    'right_triangle_problems',
    'congruence_and_similarity'
  ],
  [SAT_CERTS.SAT_READING]: [
    'explict_v_implicit',
    'point_of_view',
    'analyzing_relationships',
    'citing_evidence',
    'summarizing',
    'analogical_reasoning',
    'structure_passage',
    'word_choice',
    'graphs_and_data',
    'purpose_of_text',
    'analyzing_arguments',
    'connecting_texts',
    'history_passages',
    'strategies'
  ],
  [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: [
    'types_of_essays',
    'essay_structure',
    'point_of_view,',
    'persuasive_techniques',
    'citations',
    'independent_and_dependent_clauses',
    'punctuation',
    'verb_tense',
    'subject_verb_agreement',
    'specificity_and_coherence',
    'plagiarism',
    'nonnvarying_sentence_length',
    'wordiness',
    'grammatical_errors',
    'common_requests'
  ]
}

export enum DATE_RANGE_COMPARISON_FIELDS {
  CREATED_AT = '$createdAt',
  SENT_AT = '$sentAt',
  PAST_SESSION_CREATED_AT = '$pastSession.createdAt'
}
