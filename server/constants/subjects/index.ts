import { Topic } from './types'

import { MATH_SUBJECTS } from './math'
import { SCIENCE_SUBJECTS } from './science'
import { READING_WRITING_SUBJECTS } from './readingWriting'
import { COLLEGE_SUBJECTS } from './college'
import { SAT_SUBJECTS } from './sat'
import { TRAININGS } from './training'

function mapObjToArr<T extends Record<string, any>>(obj: T): any[] {
  return Object.keys(obj).map(key => obj[key])
}

const MATH: Topic = {
  key: 'math',
  displayName: 'Math Tutoring',
  subjects: mapObjToArr(MATH_SUBJECTS),
  trainings: [TRAININGS.UPCHIEVE_101, TRAININGS.TUTORING_SKILLS]
}
const SCIENCE: Topic = {
  key: 'science',
  displayName: 'Science Tutoring',
  subjects: mapObjToArr(SCIENCE_SUBJECTS),
  trainings: [TRAININGS.UPCHIEVE_101, TRAININGS.TUTORING_SKILLS]
}
const READING_WRITING: Topic = {
  key: 'readingWriting',
  displayName: 'Reading & Writing Tutoring',
  subjects: mapObjToArr(READING_WRITING_SUBJECTS),
  trainings: [TRAININGS.UPCHIEVE_101, TRAININGS.TUTORING_SKILLS]
}
const COLLEGE: Topic = {
  key: 'college',
  displayName: 'College Counseling',
  subjects: mapObjToArr(COLLEGE_SUBJECTS),
  trainings: [
    TRAININGS.UPCHIEVE_101,
    TRAININGS.COLLEGE_COUNSELING,
    TRAININGS.COLLEGE_SKILLS
  ]
}
const SAT: Topic = {
  key: 'sat',
  displayName: 'SAT Tutoring',
  subjects: mapObjToArr(SAT_SUBJECTS),
  trainings: [TRAININGS.UPCHIEVE_101, TRAININGS.SAT_STRATEGIES]
}

interface RootTopicsType {
  MATH: Topic
  SCIENCE: Topic
  READING_WRITING: Topic
  COLLEGE: Topic
  SAT: Topic
}

export const TOPICS: RootTopicsType = {
  MATH: MATH,
  SCIENCE: SCIENCE,
  READING_WRITING: READING_WRITING,
  COLLEGE: COLLEGE,
  SAT: SAT
}

export { MATH_SUBJECTS, MATH_CERTS } from './math'
export { SCIENCE_SUBJECTS, SCIENCE_CERTS } from './science'
export {
  READING_WRITING_SUBJECTS,
  READING_WRITING_CERTS
} from './readingWriting'
export { COLLEGE_SUBJECTS, COLLEGE_CERTS } from './college'
export { SAT_SUBJECTS, SAT_CERTS } from './sat'
export { TRAININGS } from './training'

/*
DESIGN:
- first check out ./types.ts
- Consumers of subject data only need what has been exported
- serverside consumers should only need Subject data when dealing with
  Volunteer, Session, or Question objects
  - these objects store the Legacy.key string pointing to a Topic, Subject,
    Training, or Certification
  - optimially they would store one of the objects instead of just the key but
    we don't want to have ot migrate every object over
  - So long as a user knows the target type they can search for the key
- Frontend consumers only need Subject data to list all the types and send keys
  back to the server
  - so like with the server consumers can list out all the keys and send back
    the strings on the Volunteer or Session object
  - with this centralized, structured representation of Subject data frontend
    consumers should never resort to magic strings
*/
