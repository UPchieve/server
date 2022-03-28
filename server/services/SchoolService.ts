import * as SchoolRepo from '../models/School'
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

// TODO: repo pattern - once we have stronger school type
// search for schools by name or ID
// TODO: duck type validation
export async function search(query: any): Promise<any> {
  // @note: Atlas Search is unavailable for local development. This is a
  // fallback query to be able to search for schools in local development
  // if (config.NODE_ENV === 'dev') {
    const regex = new RegExp(escapeRegex(query), 'i')
    const results = await SchoolRepo.schoolSearch(regex)
   
    if(results)
    return results
      .sort((s1: SchoolRepo.School , s2: SchoolRepo.School) => {
        if (s1.name && s2.name) {
          return s1.name.localeCompare(s2.name)
        }
        return 0
      })
      .map(school => {
        return {
          id: school.id,
          upchieveId: school.id,
          name: school.nameStored,
          districtName: school.districtNameStored,
          city: school.cityNameStored,
          state: school.stateStored,
        }
      })
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
    const schools = await SchoolRepo.getSchools({
      name, state, city, page
    } as GetSchoolsPayload, PER_PAGE, skip)
    
    const isLastPage = schools.length < PER_PAGE
    return { schools, isLastPage }
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

  const school = await SchoolRepo.createSchool({
    name, city, state, zipCode, isApproved
  } as CreateSchoolPayload)

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
