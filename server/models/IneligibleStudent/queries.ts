import { Types } from 'mongoose'
import IneligibleStudentModel, { IneligibleStudent } from './index'
import { RepoReadError, RepoCreateError } from '../Errors'
import { GRADES } from '../../constants'

export async function getIneligibleStudentByEmail(
  email: string
): Promise<IneligibleStudent | undefined> {
  try {
    const result = await IneligibleStudentModel.findOne({ email })
      .lean()
      .exec()
    if (result) return result as IneligibleStudent
  } catch (err) {
    throw new RepoReadError(err)
  }
}

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
export async function getIneligibleStudentsPaginated(
  page: number
): Promise<{
  ineligibleStudents: IneligibleStudentsWithSchoolInfo[]
  isLastPage: boolean
}> {
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
            as: 'zipCode',
          },
        },
        { $unwind: '$zipCode' },
        {
          $lookup: {
            from: 'schools',
            localField: 'school',
            foreignField: '_id',
            as: 'school',
          },
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
                else: '$school.nameStored',
              },
            },
            schoolState: '$school.ST',
            schoolCity: '$school.MCITY',
            schoolZipCode: '$school.MZIP',
            isApproved: '$school.isApproved',
            ipAddress: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: PER_PAGE,
        },
      ]
    )

    const isLastPage = ineligibleStudents.length < PER_PAGE
    return { ineligibleStudents, isLastPage }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createIneligibleStudent(
  email: string,
  zipCode: string,
  schoolId: Types.ObjectId | undefined,
  ipAddress: string,
  referredBy: Types.ObjectId | undefined,
  currentGrade?: GRADES
): Promise<IneligibleStudent> {
  try {
    const data = await IneligibleStudentModel.create({
      email,
      zipCode,
      school: schoolId,
      ipAddress,
      referredBy,
      currentGrade,
    })
    if (data) return data.toObject() as IneligibleStudent
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}
