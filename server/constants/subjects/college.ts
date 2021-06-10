import { Certification, Subject } from './types'

const ESSAYS: Subject = {
  key: 'essays',
  displayName: 'Essays',
  launched: true
}
const FINANCIAL_AID: Subject = {
  key: 'financialAid',
  displayName: 'Financial Aid',
  launched: false
}
const SPORTS_RECRUITMENT_PLANNING: Subject = {
  key: 'sportsRecruitmentPlanning',
  displayName: 'Sports Recruitment Planning',
  launched: false
}
const PLANNING: Subject = {
  key: 'planning',
  displayName: 'Planning',
  launched: true
}
const APPLICATIONS: Subject = {
  key: 'applications',
  displayName: 'Applications',
  launched: true
}

export interface COLLEGE_CERTS_TYPES {
  ESSAYS: Certification
  FINANCIAL_AID: Certification
  SPORTS_RECRUITMENT_PLANNING: Certification
  PLANNING: Certification
  APPLICATIONS: Certification
}

export const COLLEGE_CERTS: COLLEGE_CERTS_TYPES = {
  ESSAYS: {
    key: ESSAYS.key,
    displayName: ESSAYS.displayName,
    unlocks: [ESSAYS],
    numQuestions: 3,
    subCategories: [
      'basic',
      'commonapp',
      'answer',
      'dhistory',
      'optional',
      'supplemental'
    ]
  },
  FINANCIAL_AID: {
    key: FINANCIAL_AID.key,
    displayName: FINANCIAL_AID.displayName,
    unlocks: [FINANCIAL_AID],
    numQuestions: 1,
    subCategories: []
  },
  SPORTS_RECRUITMENT_PLANNING: {
    key: SPORTS_RECRUITMENT_PLANNING.key,
    displayName: SPORTS_RECRUITMENT_PLANNING.displayName,
    unlocks: [SPORTS_RECRUITMENT_PLANNING],
    numQuestions: 1,
    subCategories: []
  },
  PLANNING: {
    key: PLANNING.key,
    displayName: PLANNING.displayName,
    unlocks: [PLANNING],
    numQuestions: 4,
    subCategories: ['exam', 'type', 'LOR', 'basic']
  },
  APPLICATIONS: {
    key: APPLICATIONS.key,
    displayName: APPLICATIONS.displayName,
    unlocks: [APPLICATIONS],
    numQuestions: 2,
    subCategories: [
      'timeline',
      'resume',
      'schools',
      'fees',
      'FinAid',
      'LOR',
      'basic'
    ]
  }
}

export interface COLLEGE_SUBJECTS_TYPES {
  ESSAYS: Subject
  FINANCIAL_AID: Subject
  SPORTS_RECRUITMENT_PLANNING: Subject
  PLANNING: Subject
  APPLICATIONS: Subject
}

export const COLLEGE_SUBJECTS: COLLEGE_SUBJECTS_TYPES = {
  ESSAYS: ESSAYS,
  FINANCIAL_AID: FINANCIAL_AID,
  SPORTS_RECRUITMENT_PLANNING: SPORTS_RECRUITMENT_PLANNING,
  PLANNING: PLANNING,
  APPLICATIONS: APPLICATIONS
}
