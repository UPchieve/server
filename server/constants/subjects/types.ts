// All subject related objects need a string key for backwards compatibility
// and a displayName to eliminate the need for magic strings in the frontend
interface Legacy {
  key: string
  displayName: string
}

// Unlaunched subjects do not appear for students
export interface Subject extends Legacy {
  launched: boolean
}

// Certifications list any subjects they unlock and map to their quiz subcategories
// and the number of questions from each subcategory a quiz uses
export interface Certification extends Legacy {
  numQuestions: number
  unlocks: Subject[]
  subCategories: string[]
}

// Computed Subjects are unlocked by having ALL certs in .certifications whereas
// regular subjects are unlocked upon completion of ANY cert which lists the
// subject in cert.unlocks
export interface ComputedSubject extends Subject {
  certifications: Certification[]
}

// A training is functionally identical to a certification except instead of
// unlocking a single subject it unlocks an entire topic.
export interface Training extends Legacy {
  numQuestions: number
  subCategories: string[]
  launched: boolean
}

// Topics are unlocked like ComputedSubjects - a user must have completed
// ALL trainings in in topic.trainings to truly unlock any subject within
export interface Topic extends Legacy {
  subjects: Subject[]
  trainings: Training[]
}
