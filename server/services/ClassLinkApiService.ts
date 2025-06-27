import axios from 'axios'

const CLASSLINK_API_BASE = 'https://nodeapi.classlink.com'

export type ClassLinkProfileRole =
  | 'Student'
  | 'Teacher'
  | 'Tenant Administrator'

type ClassLinkProfile = {
  UserId: number
  TenantId: number
  StateId: number
  StateName: string
  BuildingId: number
  AuthenticationType: number
  DisplayName: string
  FirstName: string
  LastName: string
  Email: string
  LoginId: string
  ImagePath: string
  LanguageId: number
  Language: string
  DefaultTimeFormat: number
  Profile: string
  ProfileId: number
  Tenant: string
  Building: string
  Role: ClassLinkProfileRole
  Role_Level: number
  LastAccessTime: Date
  OrgId: string[]
  SourcedId: string
}

type ClassLinkDistrict = {
  tenantId: number
  name: string
  stateId: number
  state: string
  ncesId: string
  ncesName: string
}

// TODO: May need to distinguish access token types (e.g user vs. district) for rostering later
export async function getUserProfile(accessToken: string) {
  const response = await axios.get<ClassLinkProfile>(
    `${CLASSLINK_API_BASE}/v2/my/info`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return response.data
}

export async function getDistrictInformation(accessToken: string) {
  const response = await axios.get<ClassLinkDistrict>(
    `${CLASSLINK_API_BASE}/v2/my/district`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return response.data
}
