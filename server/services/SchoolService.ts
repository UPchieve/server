import * as crypto from 'crypto'
import { Types } from 'mongoose'
import SchoolModel, { School } from '../models/School/index'
import config from '../config'
import {
  asString,
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asObjectId,
} from '../utils/type-utils'

// helper to escape regex special characters
function escapeRegex(str: string) {
  return str.replace(/[.*|\\+?{}()[^$]/g, c => '\\' + c)
}
function createUpchieveId() {
  const hex = crypto.randomBytes(4).toString('hex')
  const parsedHex = parseInt(hex, 16)
  return String(parsedHex).slice(0, 8)
}

// TODO: repo pattern - once we have stronger school type
// search for schools by name or ID
// TODO: duck type validation
export async function search(query: any): Promise<any> {
  // @note: Atlas Search is unavailable for local development. This is a
  // fallback query to be able to search for schools in local development
  if (config.NODE_ENV === 'dev') {
    const regex = new RegExp(escapeRegex(query), 'i')
    const results = await SchoolModel.find({
      $or: [{ nameStored: regex }, { SCH_NAME: regex }],
    })
      .sort({ isApproved: -1 })
      .limit(100)

    return results
      .sort((s1: School, s2: School) => {
        if (s1.name && s2.name) {
          return s1.name.localeCompare(s2.name)
        }
        return 0
      })
      .map(school => {
        return {
          _id: school._id,
          upchieveId: school.upchieveId,
          name: school.name,
          districtName: school.districtName,
          city: school.city,
          state: school.state,
        }
      })
  } else {
    return SchoolModel.aggregate([
      {
        $search: {
          index: 'school_name_search',
          compound: {
            should: [
              {
                autocomplete: {
                  query,
                  path: 'SCH_NAME',
                  tokenOrder: 'sequential',
                },
              },
              {
                autocomplete: {
                  query,
                  path: 'nameStored',
                  tokenOrder: 'sequential',
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          upchieveId: 1,
          // @note: These are virtuals in models/School.ts that should be moved to properties in the school document
          name: {
            $cond: {
              if: { $not: ['$nameStored'] },
              then: '$SCH_NAME',
              else: '$nameStored',
            },
          },
          districtName: {
            $cond: {
              if: { $not: ['$districtNameStored'] },
              then: '$LEA_NAME',
              else: '$districtNameStored',
            },
          },
          city: {
            $cond: {
              if: { $not: ['$cityNameStored'] },
              then: '$LCITY',
              else: '$cityNameStored',
            },
          },
          state: {
            $cond: {
              if: { $not: ['$stateStored'] },
              then: '$ST',
              else: '$stateStored',
            },
          },
        },
      },
      {
        $limit: 100,
      },
    ])
  }
}

export async function getSchool(
  schoolId: Types.ObjectId
): Promise<School | undefined> {
  try {
    const [school] = await SchoolModel.aggregate([
      { $match: { _id: schoolId } },
      {
        $project: {
          name: {
            $cond: {
              if: { $not: ['$nameStored'] },
              then: '$SCH_NAME',
              else: '$nameStored',
            },
          },
          state: {
            $cond: {
              if: { $not: ['$stateStored'] },
              then: '$ST',
              else: '$stateStored',
            },
          },
          city: {
            $cond: {
              if: { $not: ['$cityNameStored'] },
              then: '$LCITY',
              else: '$cityNameStored',
            },
          },
          zipCode: '$MZIP',
          isApproved: 1,
          isPartner: 1,
          approvalNotifyEmails: 1,
        },
      },
    ]).exec()

    if (school) return school
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

interface GetSchoolsPayload {
  name: string
  state: string
  city: string
  page?: number
}
const asGetSchoolsPayload = asFactory<GetSchoolsPayload>({
  name: asString,
  state: asString,
  city: asString,
  page: asOptional(asNumber),
})
// TODO: clean up return type
export async function getSchools(data: unknown) {
  const { name, state, city, page } = asGetSchoolsPayload(data)
  const pageNum = page || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE
  const queries = []

  if (name) {
    const nameQuery = {
      $or: [
        { nameStored: { $regex: name, $options: 'i' } },
        { SCH_NAME: { $regex: name, $options: 'i' } },
      ],
    }
    queries.push(nameQuery)
  }
  if (state) {
    const stateQuery = {
      $or: [
        { ST: { $regex: state, $options: 'i' } },
        { stateStored: { $regex: state, $options: 'i' } },
      ],
    }
    queries.push(stateQuery)
  }
  if (city) {
    const cityQuery = {
      $or: [
        { city: { $regex: city, $options: 'i' } },
        { MCITY: { $regex: city, $options: 'i' } },
        { LCITY: { $regex: city, $options: 'i' } },
      ],
    }
    queries.push(cityQuery)
  }

  const query = queries.length === 0 ? {} : { $and: queries }

  try {
    const schools = await SchoolModel.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          name: {
            $cond: {
              if: { $not: ['$nameStored'] },
              then: '$SCH_NAME',
              else: '$nameStored',
            },
          },
          state: {
            $cond: {
              if: { $not: ['$stateStored'] },
              then: '$ST',
              else: '$stateStored',
            },
          },
          city: {
            $cond: {
              if: { $not: ['$cityNameStored'] },
              then: '$LCITY',
              else: '$cityNameStored',
            },
          },
          zipCode: '$MZIP',
          isApproved: '$isApproved',
        },
      },
    ])
      .skip(skip)
      .limit(PER_PAGE)
      .exec()

    const isLastPage = schools.length < PER_PAGE
    return { schools, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export function updateApproval(schoolId: Types.ObjectId, isApproved: boolean) {
  return SchoolModel.updateOne({ _id: schoolId }, { isApproved }).exec()
}

export function updateIsPartner(schoolId: Types.ObjectId, isPartner: boolean) {
  return SchoolModel.updateOne({ _id: schoolId }, { isPartner }).exec()
}

interface CreateSchoolPayload {
  name: string
  city: string
  state: string
  zipCode: string
  isApproved: boolean
}
const asCreateSchoolPayload = asFactory<CreateSchoolPayload>({
  name: asString,
  city: asString,
  state: asString,
  zipCode: asString,
  isApproved: asBoolean,
})

export async function createSchool(data: unknown) {
  const { name, city, state, zipCode, isApproved } = asCreateSchoolPayload(data)
  let upchieveId = createUpchieveId()
  let existingSchool = await SchoolModel.findOne({ upchieveId })
    .lean()
    .exec()

  // Avoid collision with schools containing the same upchieveId
  while (existingSchool) {
    upchieveId = createUpchieveId()
    existingSchool = await SchoolModel.findOne({ upchieveId })
      .lean()
      .exec()
  }

  const schoolData = {
    isApproved,
    nameStored: name,
    cityNameStored: city,
    stateStored: state,
    MZIP: zipCode,
    LZIP: zipCode,
    upchieveId,
  }
  const school = new SchoolModel(schoolData)

  await school.save()
  return school.toObject()
}

interface AdminUpdate {
  schoolId: Types.ObjectId
  name?: string
  city?: string
  state?: string
  zipCode?: number
  isApproved?: boolean
}
const asAdminUpdate = asFactory<AdminUpdate>({
  schoolId: asObjectId,
  name: asOptional(asString),
  city: asOptional(asString),
  state: asOptional(asString),
  zipCode: asOptional(asNumber),
  isApproved: asOptional(asBoolean),
})

export async function adminUpdateSchool(data: unknown) {
  const { schoolId, name, city, state, zipCode, isApproved } = asAdminUpdate(
    data
  )
  const schoolData = {
    isApproved,
    nameStored: name,
    cityNameStored: city,
    stateStored: state,
    MZIP: zipCode,
    LZIP: zipCode,
  }

  return SchoolModel.updateOne({ _id: schoolId }, schoolData)
}
