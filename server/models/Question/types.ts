import { Pgid } from '../pgUtils'

export type Question = {
  _id?: Pgid // legacy ID for frontend
  id: Pgid
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
  updatedAt: Date
}

export type ReviewMaterial = {
  category: string
  title: string
  pdf: string
  image: string
}
