import { values } from 'lodash'
import { Document, model, Schema, Types } from 'mongoose'
import { SURVEY_TYPES } from '../../constants'
import { User } from '../User'

export interface Survey {
  _id: Types.ObjectId
  session: Types.ObjectId
  responseData: { [key: string]: any }
  user: Types.ObjectId | User
  surveyType: SURVEY_TYPES
  createdAt: Date
}

type SurveyDocument = Survey & Document

const surveySchema = new Schema({
  session: {
    type: Types.ObjectId,
    ref: 'Session',
  },

  user: {
    type: Types.ObjectId,
    ref: 'User',
  },

  surveyType: {
    type: String,
    enum: values(SURVEY_TYPES),
  },

  responseData: {
    type: Object,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const SurveyModel = model<SurveyDocument>('Survey', surveySchema)

export default SurveyModel
