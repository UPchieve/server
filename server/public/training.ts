import type {
  QuestionPublic,
  ReviewMaterialPublic,
  TrainingCourseMaterialPublic,
  TrainingCourseModulePublic,
  TrainingCourseWithUserProgressPublic,
  TrainingMaterialLinkPublic,
  UserTrainingCourseProgressUpdatePublic,
} from '../contracts/training'
import type { Question, ReviewMaterial } from '../models/Question'
import type {
  TrainingCourseMaterial,
  TrainingCourseModule,
  TrainingCourseWithUserProgress,
  TrainingMaterialLink,
  UserTrainingCourseProgressUpdate,
} from '../types/training'

export function toQuestionPublic(question: Question): QuestionPublic {
  return {
    _id: question.id,
    id: question.id,
    questionText: question.questionText,
    possibleAnswers: question.possibleAnswers.map((q) => ({
      txt: q.txt,
      val: q.val,
    })),
    correctAnswer: question.correctAnswer,
    category: question.category,
    subcategory: question.subcategory,
    imageSrc: question.imageSrc,
    createdAt: question.createdAt.toISOString(),
  }
}

export function toReviewMaterialPublic(
  material: ReviewMaterial
): ReviewMaterialPublic {
  return {
    category: material.category,
    title: material.title,
    pdf: material.pdf,
    image: material.image,
  }
}

function toTrainingMaterialLinkPublic(
  link: TrainingMaterialLink
): TrainingMaterialLinkPublic {
  return {
    displayName: link.displayName,
    url: link.url,
  }
}

function toTrainingCourseMaterialPublic(
  material: TrainingCourseMaterial
): TrainingCourseMaterialPublic {
  return {
    name: material.name,
    description: material.description,
    materialKey: material.materialKey,
    isRequired: material.isRequired,
    type: material.type,
    resourceId: material.resourceId,
    linkUrl: material.linkUrl,
    links: material.links?.map(toTrainingMaterialLinkPublic),
    videoPDF: material.videoPDF,
    linkLabel: material.linkLabel,
  }
}

function toTrainingCourseModulePublic(
  module: TrainingCourseModule
): TrainingCourseModulePublic {
  return {
    name: module.name,
    key: module.key,
    materials: module.materials.map(toTrainingCourseMaterialPublic),
    quizKey: module.quizKey,
  }
}

export function toTrainingCourseWithUserProgressPublic(
  course: TrainingCourseWithUserProgress
): TrainingCourseWithUserProgressPublic {
  return {
    name: course.name,
    courseKey: course.courseKey,
    description: course.description,
    modules: course.modules.map(toTrainingCourseModulePublic),
    requiredCertifications: course.requiredCertifications,
    quizKey: course.quizKey,
    quizName: course.quizName,
    progress: course.progress,
    completedMaterials: course.completedMaterials,
    isComplete: course.isComplete,
  }
}

export function toUserTrainingCourseProgressUpdatePublic(
  progress: UserTrainingCourseProgressUpdate
): UserTrainingCourseProgressUpdatePublic {
  return {
    progress: progress.progress,
    isComplete: progress.isComplete,
    completedMaterialKeys: progress.completedMaterialKeys,
  }
}
