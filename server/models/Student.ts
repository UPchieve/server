import { Document, Schema, Types } from 'mongoose'
import { values } from 'lodash'
import { GRADES } from '../constants'
import UserModel, { User } from './User'
import { School } from './School'

export interface Student extends User {
  approvedHighschool: School | Types.ObjectId
  zipCode: string
  studentPartnerOrg: string
  partnerSite: string
  currentGrade?: GRADES
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
      enum: values(GRADES)
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
