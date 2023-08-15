import * as SchoolRepo from '../models/School'
import {
  asString,
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
} from '../utils/type-utils'
import { Ulid } from '../models/pgUtils'
import { PartnerSchool } from '../models/School'
import { getClient } from '../db'

// helper to escape regex special characters
function escapeRegex(str: string) {
  return str.replace(/[.*|\\+?{}()[^$]/g, c => '\\' + c)
}

type SchoolForFrontend = {
  id: Ulid
  upchieveId: Ulid
  name: string
  districtName: string | undefined
  city: string | undefined
  state: string
}

// search for schools by name
export async function search(query: string): Promise<SchoolForFrontend[]> {
  const results = await SchoolRepo.schoolSearch(query)

  return results
    .sort((s1: SchoolRepo.School, s2: SchoolRepo.School) => {
      if (s1.name && s2.name) {
        return s1.name.localeCompare(s2.name)
      }
      return 0
    })
    .map(school => {
      return {
        id: school.id,
        upchieveId: school.id,
        name: school.name,
        districtName: school.district,
        city: school.city,
        state: school.state,
      }
    })
}

export async function getSchool(schoolId: Ulid): Promise<SchoolRepo.School> {
  try {
    const school = await SchoolRepo.getSchoolById(schoolId)

    if (!school) throw new Error(`no school found with id ${schoolId}`)

    return school
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

interface GetSchoolsPayload {
  name?: string
  state?: string
  city?: string
  page?: number
}
const asGetSchoolsPayload = asFactory<GetSchoolsPayload>({
  name: asOptional(asString),
  state: asOptional(asString),
  city: asOptional(asString),
  page: asOptional(asNumber),
})
// TODO: clean up return type
export async function getSchools(data: unknown) {
  const { name, state, city, page } = asGetSchoolsPayload(data)
  const pageNum = page || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  try {
    const schools = await SchoolRepo.getSchools(
      {
        name,
        state,
        city,
        page,
      } as GetSchoolsPayload,
      PER_PAGE,
      skip
    )

    const isLastPage = schools.length < PER_PAGE
    return {
      schools: schools.map(s => {
        return { ...s, _id: s.id }
      }),
      isLastPage,
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

export interface AdminUpdate {
  schoolId: Ulid
  name: string
  city: string
  state: string
  zip: string
  isApproved: boolean
}
const asAdminUpdate = asFactory<AdminUpdate>({
  schoolId: asString,
  name: asString,
  city: asString,
  state: asString,
  zip: asString,
  isApproved: asBoolean,
})

export async function adminUpdateSchool(data: unknown) {
  const { schoolId, name, city, state, zip, isApproved } = asAdminUpdate(data)
  const schoolData = {
    schoolId,
    name,
    city,
    state,
    zip,
    isApproved,
  }

  return SchoolRepo.adminUpdateSchool(schoolData)
}

export async function titlecaseSchoolNames() {
  return Promise.all([
    SchoolRepo.titlecaseSchoolNames(),
    SchoolRepo.titlecaseMetadataSchoolNames(),
  ])
}

export async function getPartnerSchools(): Promise<
  PartnerSchool[] | undefined
> {
  return SchoolRepo.getPartnerSchools(getClient())
}
