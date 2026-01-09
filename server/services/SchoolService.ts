import * as SchoolRepo from '../models/School'
import { asString, asBoolean, asFactory } from '../utils/type-utils'
import { Ulid } from '../models/pgUtils'
import { getClient, runInTransaction, TransactionClient } from '../db'
import * as StudentPartnerOrgRepo from '../models/StudentPartnerOrg'
import {
  AdminPartnerSchoolPublic,
  AdminSchoolPublic,
  GetSchoolsPayload,
} from '../contracts/schools'

type SchoolForFrontend = {
  id: Ulid
  upchieveId: Ulid
  name: string
  districtName: string | undefined
  city: string | undefined
  state: string
}

export function toAdminSchoolPublic(
  school: SchoolRepo.School
): AdminSchoolPublic {
  return {
    id: school.id,
    name: school.name,
    city: school.city,
    state: school.state,
    ncesId: school.ncesId,
    zip: school.zip,
    district: school.district,
    schoolYear: school.schoolYear,
    isSchoolWideTitle1: school.isSchoolWideTitle1,
    title1SchoolStatus: school.title1SchoolStatus,
    nationalSchoolLunchProgram: school.nationalSchoolLunchProgram,
    totalStudents: school.totalStudents,
    nslpDirectCertification: school.nslpDirectCertification,
    frlEligible: school.frlEligible,
    isAdminApproved: school.isAdminApproved ?? false,
    isPartner: school.isPartner ?? false,
  }
}

export function toAdminPartnerSchoolPublic(
  school: SchoolRepo.PartnerSchool
): AdminPartnerSchoolPublic {
  return {
    schoolId: school.schoolId,
    schoolName: school.schoolName,
    partnerKey: school.partnerKey,
    partnerSites: school.partnerSites,
  }
}

// search for schools by name
export async function search(query: string): Promise<SchoolForFrontend[]> {
  const q = query.substring(0, 70) // avoid prohibitively long queries for performance reasons
  const results = await SchoolRepo.schoolSearch(q)

  return results.map((school) => {
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

export async function getSchoolByNcesId(ncesId: string) {
  return SchoolRepo.getSchoolByNcesId(ncesId)
}

export async function getSchools(data: GetSchoolsPayload) {
  const pageNum = data.page ?? 1
  const pageLimit = data.limit ?? 15
  // Get one more than the page limit to return to the client
  // so we can determine whether there are additional pages.
  const fetchLimit = pageLimit + 1
  const offset = (pageNum - 1) * pageLimit

  return runInTransaction(async (tc: TransactionClient) => {
    const [schools, totalCount] = await Promise.all([
      SchoolRepo.getFilteredSchools(data, fetchLimit, offset, tc),
      SchoolRepo.getFilteredSchoolsTotalCount(data, tc),
    ])
    return {
      isLastPage: schools.length < fetchLimit,
      totalCount,
      schools: schools.slice(0, pageLimit),
    }
  })
}

export function updateApproval(schoolId: Ulid, isApproved: boolean) {
  return SchoolRepo.updateApproval(schoolId, isApproved)
}

export async function updateIsPartner(schoolId: Ulid, isPartner: boolean) {
  return await runInTransaction(async (tc) => {
    const existingStudentPartnerOrg =
      await StudentPartnerOrgRepo.getStudentPartnerOrgBySchoolId(tc, schoolId)
    return SchoolRepo.updateIsPartner(
      schoolId,
      isPartner,
      existingStudentPartnerOrg?.partnerId,
      tc
    )
  }, getClient())
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
  return await runInTransaction(async (tc) => {
    return SchoolRepo.adminUpdateSchool(schoolData, tc)
  }, getClient())
}

export async function titlecaseSchoolNames() {
  return Promise.all([
    SchoolRepo.titlecaseSchoolNames(),
    SchoolRepo.titlecaseMetadataSchoolNames(),
  ])
}

export async function getPartnerSchools(): Promise<SchoolRepo.PartnerSchool[]> {
  return SchoolRepo.getPartnerSchools(getClient())
}
