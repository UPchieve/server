import { Document, model, Schema, Types } from 'mongoose'
import { School } from './School'
import { User } from './User'
import { values } from 'lodash'

enum GRADES {
  EIGHTH = '8th grade',
  NINTH = '9th grade',
  TENTH = '10th grade',
  ELEVENTH = '11th grade',
  TWELVETH = '12th grade',
  COLLEGE = 'College',
  OTHER = 'Other'
}

export interface IneligibleStudent {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  zipCode: string
  school: Types.ObjectId | School
  ipAddress: string
  referredBy: Types.ObjectId | User
  currentGrade: GRADES
}

export type IneligibleStudentDocument = IneligibleStudent & Document

const ineligibleStudentSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: String,
  zipCode: String,
  school: {
    type: Types.ObjectId,
    ref: 'School'
  },
  ipAddress: String,
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  currentGrade: {
    type: String,
    required: true,
    enum: values(GRADES)
  }
})

const IneligibleStudentModel = model<IneligibleStudentDocument>(
  'IneligibleStudent',
  ineligibleStudentSchema
)

module.exports = IneligibleStudentModel
export default IneligibleStudentModel
