import axios, { AxiosRequestConfig } from 'axios'
import config from '../config'
import { ISOString } from '../constants'
import * as SchoolService from './SchoolService'
import * as UserCreationService from './UserCreationService'

const OAUTH_BASE_URI = 'https://clever.com/oauth/tokens'
const API_BASE_URI = 'https://api.clever.com/v3.0'

type TCleverLinks = {
  rel: string
  uri: string
}[]

type TCleverDistrict = {
  data: {
    id: string
    created: ISOString
    owner: Object
    access_token: string
    scopes: string[]
  }[]
  links: TCleverLinks
}

type TCleverSchool = {
  data: {
    data: {
      district: string
      sis_id: string
      nces_id?: string
      last_modified: ISOString
      name: string
      school_number: string
      created: ISOString
      id: string
    }
    uri: string
  }[]
  links: TCleverLinks
}

type TCleverStudent = {
  data: TCleverStudentData[]
  links: TCleverLinks
}

type TCleverStudentData = {
  data: {
    created: ISOString
    district: string
    email: string
    last_modified: ISOString
    name: { first: string; last: string; middle: string }
    id: string
    roles: {
      student: {
        credentials: { district_username: string }
        dob: string // Like M/DD/YYYY
        enrollments: []
        gender: string
        grade: string // Like 6, 7, 8, etc.
        graduation_year: string
        hispanic_ethnicity: string
        location: { address: string; city: string; state: string; zip: string }
        race: string
        school: string
        schools: string[]
        sis_id: string
        state_id: string
        student_number: string
        email: string
      }
    }
  }
  uri: string
}

type UPchieveSchoolId = string

/**
 * Clever Secure Sync Integration (i.e. rostering with Clever).
 *
 * Admins can perform this action through the "Clever Roster" option on the admin
 * console in app.
 *
 * First, we get the district's access token using the district's id and basic auth.
 * With the district access token, we can then get the schools in the district and
 * the students within those schools. Once we have the students belonging to a school,
 * we can upsert the students.
 *
 * Right now, we are really just interested in getting the updated school for students who
 * are using Clever, but there is a lot more data we can pull from Clever that might
 * be useful to integrate with in the future.
 */
export async function rosterDistrict(
  districtId: string,
  cleverToUPchieveIds?: { [cleverSchoolId: string]: UPchieveSchoolId }
) {
  const accessToken = await getDistrictAccessToken(districtId)
  const options = {
    headers: createBearerAuthHeader(accessToken),
  }

  const schools = await getSchoolsInDistrict(options)

  const upsertReport: {
    updatedSchools: {
      [cleverSchoolId: string]: {
        upchieveSchoolId: string
        created: unknown[]
        updated: unknown[]
        failed: unknown[]
      }
    }
    failedSchools: { [cleverSchoolId: string]: string }
  } = {
    updatedSchools: {},
    failedSchools: {},
  }

  for (const school of schools) {
    try {
      let upchieveSchool

      const upchieveSchoolId = cleverToUPchieveIds?.[school.data.id]
      if (upchieveSchoolId) {
        upchieveSchool = await SchoolService.getSchool(upchieveSchoolId)
      } else if (school.data.nces_id) {
        upchieveSchool = await SchoolService.getSchoolByNcesId(
          school.data.nces_id
        )
      }

      if (!upchieveSchool) {
        let failureReason
        if (upchieveSchoolId) {
          failureReason = `No UPchieve school found with ID of ${upchieveSchoolId}`
        } else if (school.data.nces_id) {
          failureReason = `No UPchieve school found with nces_id of ${school.data.nces_id}`
        } else {
          failureReason =
            'Clever school does not contain nces_id and no mapping to UPchieve school provided.'
        }

        upsertReport.failedSchools[school.data.id] = failureReason
        continue
      }

      let cleverStudents = await getStudentsInSchool(school.data.id, options)
      while (cleverStudents.length) {
        const students = cleverStudents.map((s: TCleverStudentData) => {
          return {
            firstName: s.data.name.first,
            lastName: s.data.name.last,
            email: s.data.email,
            gradeLevel: s.data.roles.student.grade,
          }
        })
        const result = await UserCreationService.rosterPartnerStudents(
          students,
          upchieveSchool.id,
          false
        )
        if (upsertReport.updatedSchools[school.data.id]) {
          upsertReport.updatedSchools[school.data.id].failed.push(
            ...result.failed
          )
          upsertReport.updatedSchools[school.data.id].updated.push(
            ...result.updated
          )
          upsertReport.updatedSchools[school.data.id].created.push(
            ...result.created
          )
        } else {
          upsertReport.updatedSchools[school.data.id] = {
            upchieveSchoolId: upchieveSchool.id,
            ...result,
          }
        }
        const lastStudentCleverId =
          cleverStudents[cleverStudents.length - 1].data.id
        cleverStudents = await getStudentsInSchool(
          school.data.id,
          options,
          lastStudentCleverId
        )
      }
    } catch (err) {
      upsertReport.failedSchools[school.data.id] = `Error: ${err}`
      continue
    }
  }

  return upsertReport
}

async function getDistrictAccessToken(districtId: string): Promise<string> {
  const options = {
    headers: createBasicAuthHeader(),
  }
  const response = await axios.get<TCleverDistrict>(
    OAUTH_BASE_URI + '?district=' + districtId,
    options
  )
  return response.data.data[0].access_token
}

async function getSchoolsInDistrict(options: AxiosRequestConfig) {
  const response = await axios.get<TCleverSchool>(
    API_BASE_URI + '/schools',
    options
  )
  return response.data.data
}

async function getStudentsInSchool(
  cleverSchoolId: string,
  options: AxiosRequestConfig,
  startingAfterId?: string
) {
  const url =
    API_BASE_URI +
    '/schools/' +
    cleverSchoolId +
    '/users?primary=true&role=student&limit=500' +
    (startingAfterId ? `&starting_after=${startingAfterId}` : '')
  const response = await axios.get(url, options)
  return response.data.data ?? []
}

function createBasicAuthHeader() {
  return {
    Authorization:
      'Basic ' +
      Buffer.from(
        config.cleverClientId + ':' + config.cleverClientSecret
      ).toString('base64'),
  }
}

function createBearerAuthHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}
