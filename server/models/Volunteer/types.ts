import {
  REFERENCE_STATUS,
  TRAINING
} from '../../constants'
import { Ulid } from '../pgUtils'

export interface Reference {
  id: Ulid
  firstName: string
  lastName: string
  createdAt: Date
  email: string
  status?: REFERENCE_STATUS
  sentAt?: Date
  affiliation?: string
  relationshipLength?: string
  patient?: number
  positiveRoleModel?: number
  agreeableAndApproachable?: number
  communicatesEffectively?: number
  trustworthyWithChildren?: number
  rejectionReason?: string
  additionalInfo?: string
}

export type CertificationInfo = {
  passed: boolean
  tries: number
  lastAttemptedAt?: Date
}

export type Certifications = {
  [subject: string]: CertificationInfo
}

export type TrainingCourseData = {
  isComplete: boolean
  progress: number
  completedMaterials: string[]
}

export type TrainingCourses = {
  [TRAINING.UPCHIEVE_101]: TrainingCourseData
  [TRAINING.TUTORING_SKILLS]: TrainingCourseData
  [TRAINING.COLLEGE_COUNSELING]: TrainingCourseData
  [TRAINING.COLLEGE_SKILLS]: TrainingCourseData
  [TRAINING.SAT_STRATEGIES]: TrainingCourseData
}
