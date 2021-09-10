import { Certification, Subject } from './types'

const SAT_MATH: Subject = {
  key: 'satMath',
  displayName: 'SAT Math',
  launched: false
}
const SAT_READING: Subject = {
  key: 'satReading',
  displayName: 'SAT Reading',
  launched: false
}

export interface RootSatCertsType {
  SAT_MATH: Certification
  SAT_READING: Certification
}

export const SAT_CERTS: RootSatCertsType = {
  SAT_MATH: {
    key: SAT_MATH.key,
    displayName: SAT_MATH.displayName,
    numQuestions: 1,
    unlocks: [SAT_MATH],
    subCategories: [
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
    ]
  },
  SAT_READING: {
    key: SAT_READING.key,
    displayName: SAT_READING.displayName,
    numQuestions: 1,
    unlocks: [SAT_READING],
    subCategories: [
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
    ]
  }
}

export interface RootSatSubjectsType {
  SAT_MATH: Subject
  SAT_READING: Subject
}

export const SAT_SUBJECTS: RootSatSubjectsType = {
  SAT_MATH: SAT_MATH,
  SAT_READING: SAT_READING
}
