import * as crypto from 'crypto'
import * as SchoolRepo from '../models/School'
import config from '../config'
import {
  asString,
  asBoolean,
  asFactory,
  asNumber,
  asOptional
} from '../utils/type-utils'
import { Ulid } from '../models/pgUtils'

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
  schoolId: Ulid
): Promise<SchoolRepo.School | undefined> {
  try {
    const school = await SchoolRepo.getSchool(schoolId)

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

  try {
    const schools = await SchoolRepo.getSchools(data as GetSchoolsPayload, PER_PAGE, skip)
    
    if(schools){
      const isLastPage = schools.length < PER_PAGE
      return { schools, isLastPage }
    }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export function updateApproval(schoolId: Ulid, isApproved: boolean) {
  return SchoolRepo.updateApproval(schoolId, isApproved)
}

export function updateIsPartner(schoolId: Ulid, isPartner: boolean) {
  return SchoolRepo.updateIsPartner(schoolId, isPartner)
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
  let existingSchool = await SchoolRepo.findSchoolByUpchieveId( upchieveId )

  // Avoid collision with schools containing the same upchieveId
  while (existingSchool) {
    upchieveId = createUpchieveId()
    existingSchool = await SchoolRepo.findSchoolByUpchieveId( upchieveId )
  }

  const school = await SchoolRepo.createSchool(data as CreateSchoolPayload)

  return school
}

interface AdminUpdate {
  schoolId: Ulid
  name?: string
  city?: string
  state?: string
  zipCode?: string
  isApproved?: boolean
}
const asAdminUpdate = asFactory<AdminUpdate>({
  schoolId: asString,
  name: asOptional(asString),
  city: asOptional(asString),
  state: asOptional(asString),
  zipCode: asOptional(asString),
  isApproved: asOptional(asBoolean),
})

export async function adminUpdateSchool(data: unknown) {
  const { schoolId, name, city, state, zipCode, isApproved } = asAdminUpdate(
    data
  )
  const schoolData = {
    isApproved,
    name,
    city,
    state,
    zipCode,
    schoolId
  }

  return SchoolRepo.adminUpdateSchool(data as AdminUpdate)
}
