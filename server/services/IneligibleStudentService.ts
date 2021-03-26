import { Types } from 'mongoose'
import IneligibleStudentModel, {
  IneligibleStudent
} from '../models/IneligibleStudent'

export interface IneligibleStudentsWithSchoolInfo {
  createdAt: Date
  email: string
  zipCode: string
  medianIncome: number
  schoolId: Types.ObjectId
  schoolName: string
  schoolState: string
  schoolCity: string
  schoolZipCode: string
  isApproved: boolean
  ipAddress: string
}

export const getStudent = (
  query: Partial<IneligibleStudent>
): Promise<IneligibleStudent> => {
  return IneligibleStudentModel.findOne(query)
    .lean()
    .exec()
}

export const getStudents = async (
  page: number
): Promise<{
  ineligibleStudents: IneligibleStudentsWithSchoolInfo[]
  isLastPage: boolean
}> => {
  const PER_PAGE = 15
  const skip = (page - 1) * PER_PAGE

  try {
    const ineligibleStudents: IneligibleStudentsWithSchoolInfo[] = await IneligibleStudentModel.aggregate(
      [
        {
          $lookup: {
            from: 'zipcodes',
            localField: 'zipCode',
            foreignField: 'zipCode',
            as: 'zipCode'
          }
        },
        { $unwind: '$zipCode' },
        {
          $lookup: {
            from: 'schools',
            localField: 'school',
            foreignField: '_id',
            as: 'school'
          }
        },
        { $unwind: '$school' },
        {
          $project: {
            createdAt: 1,
            email: 1,
            zipCode: '$zipCode.zipCode',
            medianIncome: '$zipCode.medianIncome',
            schoolId: '$school._id',
            schoolName: {
              $cond: {
                if: { $not: ['$school.nameStored'] },
                then: '$school.SCH_NAME',
                else: '$school.nameStored'
              }
            },
            schoolState: '$school.ST',
            schoolCity: '$school.MCITY',
            schoolZipCode: '$school.MZIP',
            isApproved: '$school.isApproved',
            ipAddress: 1
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: PER_PAGE
        }
      ]
    )

    const isLastPage = ineligibleStudents.length < PER_PAGE
    return { ineligibleStudents, isLastPage }
  } catch (error) {
    throw new Error(error.message)
  }
}
