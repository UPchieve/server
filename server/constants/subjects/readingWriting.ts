import { Certification, Subject } from './types'

const HUMANITIES_ESSAYS: Subject = {
  key: 'humanitiesEssays',
  displayName: 'Humanities Essays',
  launched: false
}

export interface RootReadingWritingCertsType {
  HUMANITIES_ESSAYS: Certification
}

export const READING_WRITING_CERTS: RootReadingWritingCertsType = {
  HUMANITIES_ESSAYS: {
    key: HUMANITIES_ESSAYS.key,
    displayName: HUMANITIES_ESSAYS.displayName,
    numQuestions: 1,
    unlocks: [HUMANITIES_ESSAYS],
    subCategories: [
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
}

export interface RootReadingWritingSubjectsType {
  HUMANITIES_ESSAYS: Subject
}

export const READING_WRITING_SUBJECTS: RootReadingWritingSubjectsType = {
  HUMANITIES_ESSAYS: HUMANITIES_ESSAYS
}
