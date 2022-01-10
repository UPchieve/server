import fs from 'fs'
import { Types } from 'mongoose'
import path from 'path'
import YAML from 'yaml'
import config from './config'
import { asObjectId } from './utils/type-utils'

let volunteerManifestsYaml: string | undefined
let studentManifestsYaml: string | undefined
let sponsorOrgManifestsYaml: string | undefined
let gatesPartnerSchoolsYaml: string | undefined

export interface StudentPartnerManifest {
  name: string
  highSchoolSignup?: boolean
  collegeSignup?: boolean
  schoolSignupRequired?: boolean
  signupCode?: string
  sites?: string[]
}

export interface VolunteerPartnerManifest {
  name: string
  requiredEmailDomains?: string[]
  receiveWeeklyHourSummaryEmail?: boolean
}

export interface SponsorOrgManifest {
  name: string
  schools: Types.ObjectId[]
  partnerOrgs: string[]
}

export interface GatesPartnerSchool {
  name: string
  schoolId: Types.ObjectId
}

export let volunteerPartnerManifests: { [k: string]: VolunteerPartnerManifest }
export let studentPartnerManifests: { [k: string]: StudentPartnerManifest }
export let sponsorOrgManifests: { [k: string]: SponsorOrgManifest }
export let gatesPartnerSchools: { [k: string]: GatesPartnerSchool }

if (
  process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS === '' ||
  process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS === undefined
) {
  const volunteerManifestsPath = path.join(
    __dirname,
    config.volunteerPartnerManifestPath
  )
  volunteerManifestsYaml = fs.readFileSync(volunteerManifestsPath, 'utf8')
  volunteerPartnerManifests = YAML.parse(volunteerManifestsYaml)
} else {
  volunteerManifestsYaml = process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS
  volunteerPartnerManifests = YAML.parse(volunteerManifestsYaml)
}

if (
  process.env.SUBWAY_STUDENT_PARTNER_MANIFESTS === '' ||
  process.env.SUBWAY_STUDENT_PARTNER_MANIFESTS === undefined
) {
  const studentManifestsPath = path.join(
    __dirname,
    config.studentPartnerManifestPath
  )
  studentManifestsYaml = fs.readFileSync(studentManifestsPath, 'utf8')
  studentPartnerManifests = YAML.parse(studentManifestsYaml)
} else {
  studentManifestsYaml = process.env.SUBWAY_STUDENT_PARTNER_MANIFESTS
  studentPartnerManifests = YAML.parse(studentManifestsYaml || '')
}

if (
  process.env.SUBWAY_SPONSOR_ORG_MANIFESTS === '' ||
  process.env.SUBWAY_SPONSOR_ORG_MANIFESTS === undefined
) {
  const sponsorOrgManifestsPath = path.join(
    __dirname,
    config.sponsorOrgManifestPath
  )
  sponsorOrgManifestsYaml = fs.readFileSync(sponsorOrgManifestsPath, 'utf8')
  sponsorOrgManifests = YAML.parse(sponsorOrgManifestsYaml)
} else {
  sponsorOrgManifestsYaml = process.env.SUBWAY_SPONSOR_ORG_MANIFESTS
  sponsorOrgManifests = YAML.parse(sponsorOrgManifestsYaml || '')
}

// if (
//   process.env.SUBWAY_GATES_PARTNER_SCHOOLS === '' ||
//   process.env.SUBWAY_GATES_PARTNER_SCHOOLS === undefined
// ) {
//   const gatesPartnerSchoolsPath = path.join(
//     __dirname,
//     config.gatesPartnerSchoolPath
//   )
//   gatesPartnerSchoolsYaml = fs.readFileSync(gatesPartnerSchoolsPath, 'utf8')
//   gatesPartnerSchools = YAML.parse(gatesPartnerSchoolsYaml)
// } else {
//   gatesPartnerSchoolsYaml = process.env.SUBWAY_GATES_PARTNER_SCHOOLS
//   gatesPartnerSchools = YAML.parse(gatesPartnerSchoolsYaml || '')
// }

// re-assign schools on the sponsor org manifest to be a list of object ids
for (const org in sponsorOrgManifests) {
  if (Array.isArray(sponsorOrgManifests[org].schools)) {
    const schoolObjectIds = []
    for (let school of sponsorOrgManifests[org].schools!) {
      schoolObjectIds.push(asObjectId(school))
    }
    sponsorOrgManifests[org].schools = schoolObjectIds
  }
}
