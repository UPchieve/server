import { Training } from './types'

export interface TRAININGS_TYPE {
  UPCHIEVE_101: Training
  TUTORING_SKILLS: Training
  COLLEGE_SKILLS: Training
  COLLEGE_COUNSELING: Training
  SAT_STRATEGIES: Training
}

export const TRAININGS: TRAININGS_TYPE = {
  // All subjects must require UPchieve101 training
  UPCHIEVE_101: {
    key: 'upchieve101',
    displayName: 'UPchieve 101',
    numQuestions: 27,
    subCategories: ['upchieve'],
    launched: true
  },
  TUTORING_SKILLS: {
    key: 'tutoringSkills',
    displayName: 'Tutoring Skills',
    numQuestions: 0,
    subCategories: [],
    launched: false
  },
  COLLEGE_SKILLS: {
    key: 'collegeSkills',
    displayName: 'College Skills',
    numQuestions: 0,
    subCategories: [],
    launched: false
  },
  COLLEGE_COUNSELING: {
    key: 'collegeCounseling',
    displayName: 'College Counseling',
    numQuestions: 0,
    subCategories: [],
    launched: false
  },
  SAT_STRATEGIES: {
    key: 'satStrategies',
    displayName: 'SAT Strategies',
    numQuestions: 0,
    subCategories: [],
    launched: false
  }
}
