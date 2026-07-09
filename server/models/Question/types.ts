export type Question = {
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
  createdAt: Date
}

export type ReviewMaterial = {
  category: string
  title: string
  pdf: string
  image: string
}

export type QuizCertUnlockInfo = {
  quizName: string
  unlockedCertName: string
}

export type QuizSubjectUnlockCertInfo = {
  quizName: string
  quizDisplayName: string
  quizDisplayOrder: number
  unlockedCertName: string
  unlockedCertDisplayName: string
  unlockedCertDisplayOrder: number
  topicName: string
  topicDisplayName: string
  topicDashboardOrder: number
  topicTrainingOrder: number
}

export type Quiz = {
  id: number
  name: string
  active: boolean
  questionsPerSubcategory: number
}
