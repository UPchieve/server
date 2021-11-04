import { Document, Model, model, Schema, Types } from 'mongoose'
import {
  CATEGORY_TO_SUBCATEGORY_MAP,
  ACTIVE_QUIZ_CATEGORIES,
} from '../../constants'

export interface Question {
  _id: Types.ObjectId
  questionText: string
  possibleAnswers: {
    txt: string
    val: string
  }[]
  correctAnswer: string
  category: string
  subcategory: string
  imageSrc: string
}

export type QuestionDocument = Question & Document

interface QuestionStaticModel extends Model<QuestionDocument> {
  getSubcategories(category: string): string[]
}

const questionSchema = new Schema({
  questionText: String,
  possibleAnswers: [{ txt: String, val: String }],
  correctAnswer: String,
  category: String,
  subcategory: String,
  imageSrc: String,
})

questionSchema.statics.getSubcategories = function(
  category: ACTIVE_QUIZ_CATEGORIES
): string[] {
  if (typeof category !== 'string') {
    throw new TypeError(
      'Category has a value of ' +
        category +
        '. It must be a string, not ' +
        typeof category
    )
  }

  if (CATEGORY_TO_SUBCATEGORY_MAP.hasOwnProperty(category)) {
    const subcategories = CATEGORY_TO_SUBCATEGORY_MAP[category]
    return subcategories
  } else {
    throw new ReferenceError(category + ' is not a subcategory.')
  }
}

const QuestionModel = model<QuestionDocument, QuestionStaticModel>(
  'Question',
  questionSchema,
  'question'
)

export default QuestionModel
