import { MaterialType, TRAINING, TRAINING_QUIZZES } from '../constants'
import type { AnswerMap } from '../controllers/TrainingCtrl'
import type { ISODateString } from '../types/dates'

export type QuestionPublic = {
  _id?: number // legacy ID for frontend
  id: number
  questionText: string
  possibleAnswers: {
    txt: string
    val: string
  }[]
  correctAnswer: string
  category: string
  subcategory: string
  imageSrc?: string | undefined
  createdAt: ISODateString
}

export type QuizScorePublic = {
  tries: number
  passed: boolean
  score: number
  idCorrectAnswerMap: AnswerMap
  isTrainingSubject: boolean
}

export type ReviewMaterialPublic = {
  category: string
  title: string
  pdf: string
  image: string
}

export type TrainingMaterialLinkPublic = {
  displayName: string
  url: string
}

export type TrainingCourseMaterialPublic = {
  name: string
  description?: string
  materialKey: string
  isRequired: boolean
  type: MaterialType
  // the ID Vimeo gives a video when uploaded
  resourceId?: string
  linkUrl?: string
  links?: TrainingMaterialLinkPublic[]
  videoPDF?: string
  linkLabel?: string
}

export type TrainingCourseModulePublic = {
  name: string
  key?: string
  materials: TrainingCourseMaterialPublic[]
  quizKey?: string
}

export interface TrainingCoursePublic {
  name: string
  courseKey: string
  description: string
  modules: TrainingCourseModulePublic[]
  requiredCertifications: TRAINING_QUIZZES[]
  // @TODO After deprecating the legacy training course (upchieve101), remove these props
  quizKey?: string
  quizName?: string
}

export type TrainingCourseWithUserProgressPublic = TrainingCoursePublic & {
  progress: number
  isComplete: boolean
  completedMaterials: string[]
}

export type UserTrainingCourseProgressUpdatePublic = {
  progress: number
  isComplete: boolean
  completedMaterialKeys: string[]
}

export type TrainingCourseProgressDataPublic = {
  complete: boolean
  progress: number
  completedMaterials: string[]
}

export type TrainingCoursesPublic = {
  [TRAINING.UPCHIEVE_101]: TrainingCourseProgressDataPublic
  [TRAINING.UPCHIEVE_TRAINING]: TrainingCourseProgressDataPublic
  [TRAINING.TUTORING_SKILLS]: TrainingCourseProgressDataPublic
  [TRAINING.COLLEGE_COUNSELING]: TrainingCourseProgressDataPublic
  [TRAINING.COLLEGE_SKILLS]: TrainingCourseProgressDataPublic
  [TRAINING.SAT_STRATEGIES]: TrainingCourseProgressDataPublic
}

export type QuestionsResponse = {
  msg: 'Questions retrieved from database'
  questions: QuestionPublic[]
}

export type QuizScoreResponse = {
  msg: 'Score calculated and saved'
  tries: number
  passed: boolean
  score: number
  idCorrectAnswerMap: AnswerMap
  isTrainingSubject: boolean
}

export type TrainingCourseResponse = {
  course: TrainingCourseWithUserProgressPublic
}
