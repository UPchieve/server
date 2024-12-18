import axios, { AxiosRequestConfig } from 'axios'
import config from '../config'
import { ISOString } from '../constants'

const OAUTH_BASE_URI = 'https://clever.com/oauth/tokens'
const API_BASE_URI = 'https://api.clever.com/v3.0'
const API_BASE_URI_WITHOUT_VERSION = 'https://api.clever.com'

type TCleverLinkType = 'self' | 'canonical'
type TCleverLinks = Array<{
  rel: TCleverLinkType
  uri: string
}>

type TCleverMeResponse = {
  data: {
    id: string
    district: string // Clever District ID
    type: 'user' | 'district'
    authorized_by: 'district'
  }
  type: 'user' | 'district'
  links: TCleverLinks
}

type TCleverUserInfoResponse = {
  data: {
    id: string
    created: Date
    district: string
    email?: string
    last_modified: Date
    name: {
      first: string
      last: string
      middle: string
    }
    roles: {
      student?: {
        grade?: string
        school: string // Clever ID of the student's primary school.
        schools: string[] // List of ids of schools this student is associated with.
      }
      teacher?: {
        credentials: {
          district_username: string
        }
        school: string // Clever ID of the teacher's primary school.
        schools: string[] // List of ids of schools this teacher is associated with.
        sis_id: string
        state_id: string
        teacher_number: string
        title: string
      }
    }
  }
  links: TCleverLinks
}

type TCleverDistrict = {
  data: Array<{
    id: string
    created: ISOString
    owner: Object
    access_token: string
    scopes: string[]
  }>
  links: TCleverLinks
}

type TCleverSchools = {
  data: Array<{
    data: TCleverSchoolData
    uri: string
  }>
  links: TCleverLinks
}

type TCleverSchool = {
  data: TCleverSchoolData
  links: TCleverLinks
}

type TCleverSchoolData = {
  id: string // Clever School ID
  created: ISOString
  district: string // Clever District ID
  high_grade: string
  last_modified: ISOString
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
  low_grade: string
  name: string
  nces_id?: string
  phone: string
  principal: {
    email: string
    name: string
  }
  school_number: string
  sis_id: string
  state_id: string
}

export type TCleverStudents = {
  data: Array<{
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
          location: {
            address: string
            city: string
            state: string
            zip: string
          }
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
  }>
  links: TCleverLinks
}

export type UPchieveSchoolId = string

export async function getDistrictAccessToken(
  districtId: string
): Promise<string> {
  const options = {
    headers: createBasicAuthHeader(),
  }
  const response = await axios.get<TCleverDistrict>(
    OAUTH_BASE_URI + '?district=' + districtId,
    options
  )

  return response.data.data[0].access_token
}

/*
 * @accessToken for user from SSO callback.
 *
 * Note: if we ever want more details about the district, we can
 * also use this method, though the return type is different.
 *
 */
export async function getUserProfile(
  accessToken: string
): Promise<TCleverUserInfoResponse['data']> {
  const options = {
    headers: createBearerAuthHeader(accessToken),
  }
  const meResponse = await axios.get<TCleverMeResponse>(
    API_BASE_URI + '/me',
    options
  )

  const canonicalLink = meResponse.data.links.find(link => {
    if (link.rel === 'canonical') return true
  })
  if (!canonicalLink) {
    throw new Error(`No canonical link in ${API_BASE_URI}/me response.`)
  }

  const userInfoUrl = API_BASE_URI_WITHOUT_VERSION + canonicalLink.uri
  const userInfoResponse = await axios.get<TCleverUserInfoResponse>(
    userInfoUrl,
    options
  )
  return userInfoResponse.data.data
}

/*
 * @accessToken for district.
 */
export async function getSchoolsInDistrict(
  accessToken: string
): Promise<TCleverSchools['data']> {
  const response = await axios.get<TCleverSchools>(API_BASE_URI + '/schools', {
    headers: createBearerAuthHeader(accessToken),
  })
  return response.data.data
}

/*
 * @accessToken for user from SSO callback or for district.
 */
export async function getSchool(
  cleverSchoolId: string,
  accessToken: string
): Promise<TCleverSchool['data']> {
  const response = await axios.get<TCleverSchool>(
    API_BASE_URI + '/schools/' + cleverSchoolId,
    {
      headers: createBearerAuthHeader(accessToken),
    }
  )
  return response.data.data
}

/*
 * @cleverSchoolId
 * @accessToken for district.
 * @startingAfterId
 */
export async function getStudentsInSchool(
  cleverSchoolId: string,
  accessToken: string,
  startingAfterId?: string
): Promise<TCleverStudents['data']> {
  const url =
    API_BASE_URI +
    '/schools/' +
    cleverSchoolId +
    '/users?primary=true&role=student&limit=500' +
    (startingAfterId ? `&starting_after=${startingAfterId}` : '')
  const response = await axios.get<TCleverStudents>(url, {
    headers: createBearerAuthHeader(accessToken),
  })
  return response.data.data ?? []
}

export function parseCleverGrade(grade?: string): number | undefined {
  if (!grade) return
  if (!isNaN(parseInt(grade))) {
    return parseInt(grade)
  }
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
