import { Pgid, Ulid } from '../pgUtils'

export type Question = {
  id: Pgid
  questionText: string
  possibleAnswers: {
    txt: string
    val: string
  }[]
  correctAnswer: string
  category: string
  subcategory: string
  imageSrc: string
  createdAt: Date
  updatedAt: Date
  mongoId?: Ulid
}
