import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import config from './config'

let volunteerManifestsYaml: string | undefined
let studentManifestsYaml: string | undefined

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

export let volunteerPartnerManifests: { [k: string]: VolunteerPartnerManifest }
export let studentPartnerManifests: { [k: string]: StudentPartnerManifest }

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
  process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS === undefined
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
