import { Document, Schema, Types } from 'mongoose'
import UserModel, { User } from './User'
import { School } from './School'

const enum GRADES {
  EIGHTH = '8th grade',
  NINTH = '9th grade',
  TENTH = '10th grade',
  ELEVENTH = '11th grade',
  TWELVETH = '12th grade',
  COLLEGE = 'College',
  OTHER = 'Other'
}

export interface Student extends User {
  approvedHighschool: School | Types.ObjectId
  zipCode: string
  studentPartnerOrg: string
  partnerSite: string
  currentGrade: typeof GRADES
}

export type StudentDocument = Student & Document

const schemaOptions = {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
}

const studentSchema = new Schema(
  {
    approvedHighschool: {
      type: Types.ObjectId,
      ref: 'School'
      /* TODO validate approvedHighschool.isApproved: true
       * if this.isVolunteer is false */
    },
    zipCode: String,
    studentPartnerOrg: String,
    partnerSite: String,
    currentGrade: {
      type: String,
      required: true,
      enum: CurrentGrade
    }
  },
  schemaOptions
)

// Use the user schema as the base schema for Student
const StudentModel = UserModel.discriminator<StudentDocument>(
  'Student',
  studentSchema
)

module.exports = StudentModel
export default StudentModel
