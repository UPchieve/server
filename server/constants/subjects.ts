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
  // TODO: remove `algebra` in the algebra 2 launch cleanup
  ALGEBRA = 'algebra',
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
  // TODO: remove `ALGEBRA_TWO_TEMP` in the algebra 2 launch cleanup
  ALGEBRA_TWO_TEMP = 'algebraTwo-temporary',
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
}

export enum COLLEGE_SUBJECTS {
  ESSAYS = 'essays',
  FINANCIAL_AID = 'financialAid',
  SPORTS_RECRUITMENT_PLANNING = 'sportsRecruitmentPlanning',
  PLANNING = 'planning',
  APPLICATIONS = 'applications',
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
}

export enum READING_WRITING_SUBJECTS {
  HUMANITIES_ESSAYS = 'humanitiesEssays',
}

export const SUBJECTS = {
  ...MATH_SUBJECTS,
  ...SCIENCE_SUBJECTS,
  ...COLLEGE_SUBJECTS,
  ...SAT_SUBJECTS,
  ...READING_WRITING_SUBJECTS,
}

export const CERTS = {
  ...MATH_CERTS,
  ...SCIENCE_CERTS,
  ...COLLEGE_CERTS,
  ...SAT_CERTS,
  ...READING_WRITING_CERTS,
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
  [MATH_CERTS.ALGEBRA]: [
    MATH_SUBJECTS.ALGEBRA_ONE,
    MATH_SUBJECTS.ALGEBRA_TWO,
    MATH_SUBJECTS.PREALGREBA,
  ],
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
  [COLLEGE_CERTS.ESSAYS]: [COLLEGE_SUBJECTS.ESSAYS],
  // @note: move applications and planning to computed certs once College Counseling is added
  [COLLEGE_CERTS.APPLICATIONS]: [COLLEGE_SUBJECTS.APPLICATIONS],
  [COLLEGE_CERTS.PLANNING]: [COLLEGE_SUBJECTS.PLANNING],
  [COLLEGE_CERTS.FINANCIAL_AID]: [COLLEGE_SUBJECTS.FINANCIAL_AID],
  [COLLEGE_CERTS.SPORTS_RECRUITMENT_PLANNING]: [
    COLLEGE_SUBJECTS.SPORTS_RECRUITMENT_PLANNING,
  ],
  [SAT_CERTS.SAT_MATH]: [SAT_CERTS.SAT_MATH],
  [SAT_CERTS.SAT_READING]: [SAT_CERTS.SAT_READING],
  [TRAINING.COLLEGE_COUNSELING]: [SUBJECTS.PLANNING, SUBJECTS.APPLICATIONS],
  [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: [
    READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS,
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

export const CATEGORY_TO_SUBCATEGORY_MAP: Record<
  ACTIVE_QUIZ_CATEGORIES,
  string[]
> = {
  [MATH_CERTS.PREALGREBA]: [
    'numbers',
    'arithmetic properties',
    'exponents',
    'exponents and radicals',
    'polynomials',
    'fractions',
  ],
  [MATH_CERTS.ALGEBRA]: [
    'linear equations',
    'rational exponents and radicals',
    'application of linear equations',
    'two variable equations',
    'rational expressions',
    'complex numbers',
  ],
  [MATH_CERTS.ALGEBRA_ONE]: [
    'linear equations',
    'rational exponents and radicals',
    'application of linear equations',
    'two variable equations',
    'rational expressions',
    'complex numbers',
  ],
  [MATH_CERTS.ALGEBRA_TWO]: [
    'functions_domain_range',
    'higher_degree_polynomials',
    'square_root_equations',
    'roots_of_polynomials',
    'multiply_polynomials_binomial',
    'rational_radical_absolute',
    'logarithms_properties',
    'rational_expressions',
    'systems_of_linear_equations',
    'arithmetic_and_geometric_sequences',
    'functions_domain',
    'solving_linear_equations',
    'function_transformations_shifts',
    'graphing_quadratic_functions',
    'exponential_functions_growth',
    'rounding_and_scientific_notation',
    'square root_equations_quadratic',
    'advanced_factoring_techniques',
  ],
  [MATH_CERTS.GEOMETRY]: [
    'congruence and similarity',
    'vertices',
    'angles',
    'circles',
    'triangles',
    'rectangles',
  ],
  [MATH_CERTS.TRIGONOMETRY]: [
    'angles',
    'triangles',
    'right triangles',
    'quadrants',
    'radians',
    'unit circle',
    'inequalities',
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
    'finding the test statistic',
  ],
  [MATH_CERTS.PRECALCULUS]: [
    'rectangular coordinates',
    'linear inequalities',
    'functions',
    'rational exponents',
    'quadratic functions',
    'logarithms and exponents',
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
    'relative extrema',
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
    'taylor polynomials',
  ],
  [COLLEGE_CERTS.ESSAYS]: [
    'basic',
    'commonapp',
    'answer',
    'dhistory',
    'optional',
    'supplemental',
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
    'basic',
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
    'evolution and taxonomy',
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
    'kinematics',
  ],
  [SCIENCE_CERTS.PHYSICS_ONE]: [
    'kinematics',
    "newton's laws",
    'rotational mechanics',
    'work and energy',
    'momentum and collisions',
    'thermodynamics',
    'electrostatics',
    'magnetism',
    'waves and sound',
    'refraction and reflection',
    'gravity/gen relativity',
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
    'Electric Circuits',
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
    'the atmosphere',
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
    'congruence_and_similarity',
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
    'strategies',
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
    'common_requests',
  ],
}

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
}
