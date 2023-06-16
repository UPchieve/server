import * as UserCtrl from '../controllers/UserCtrl'
import { getSchoolById } from '../models/School/queries'
import { getZipCodeByZipCode } from '../models/ZipCode/queries'
import {
  deleteIneligibleStudent,
  getIneligibleStudentByEmail,
  insertIneligibleStudent,
} from '../models/IneligibleStudent/queries'
import { getUserIdByEmail } from '../models/User/queries'
import {
  asBoolean,
  asFactory,
  asString,
  asEnum,
  asOptional,
} from '../utils/type-utils'
import { GRADES } from '../constants'
import { CustomError } from 'ts-custom-error'
import { School } from '../models/School'
import { ZipCode } from '../models/ZipCode'
import config from '../config'

type CheckEligibilityPayload = {
  schoolUpchieveId?: string
  zipCode: string
  email: string
  referredByCode?: string
  currentGrade?: GRADES
  useNewSchoolsEligibility?: boolean
}
const asCheckEligibilityPayload = asFactory<CheckEligibilityPayload>({
  schoolUpchieveId: asOptional(asString),
  zipCode: asString,
  email: asString,
  referredByCode: asOptional(asString),
  currentGrade: asOptional(asEnum(GRADES)),
  useNewSchoolsEligibility: asOptional(asBoolean),
})

type CheckEligibilityResponse = {
  message?: string
  isEligible: boolean
  isCollegeStudent?: boolean
}

export class ExistingUserError extends CustomError {}

export async function checkEligibility(
  ip: string,
  payload: unknown
): Promise<CheckEligibilityResponse> {
  const {
    schoolUpchieveId,
    zipCode: zipCodeInput,
    email,
    referredByCode,
    currentGrade,
    useNewSchoolsEligibility,
  } = asCheckEligibilityPayload(payload)

  const existingUser = await getUserIdByEmail(email)
  if (existingUser) throw new ExistingUserError()

  const isCollegeStudent = currentGrade === GRADES.COLLEGE

  const existingIneligible = await getIneligibleStudentByEmail(email)
  if (existingIneligible && (existingIneligible.school || !schoolUpchieveId)) {
    return { isEligible: false, isCollegeStudent }
  }

  const school = schoolUpchieveId
    ? await getSchoolById(schoolUpchieveId)
    : undefined
  const zipCode = await getZipCodeByZipCode(zipCodeInput)

  const isEligibleBySchool = isSchoolApproved(school, useNewSchoolsEligibility)
  const isEligibleByZipCode = isZipCodeEligible(zipCode)
  const isStudentEligible =
    (isEligibleBySchool || (isEligibleByZipCode && !existingIneligible)) &&
    !isCollegeStudent

  if (!isStudentEligible) {
    const referredBy = await UserCtrl.checkReferral(referredByCode)
    await insertIneligibleStudent(
      email,
      school?.id,
      zipCodeInput,
      currentGrade,
      referredBy,
      ip
    )
  } else if (existingIneligible) {
    await deleteIneligibleStudent(email)
  }

  return {
    isEligible: isStudentEligible,
    isCollegeStudent,
  }
}

export async function checkZipCode(param: unknown): Promise<boolean> {
  const zipCode = asString(param)
  const foundZip = await getZipCodeByZipCode(zipCode)
  return !!foundZip
}

function isZipCodeEligible(zipCode?: ZipCode) {
  return !!zipCode && zipCode.isEligible
}

export function isSchoolApproved(
  school?: School,
  useNewSchoolsEligibility: boolean = false
) {
  return (
    !!school &&
    (useNewSchoolsEligibility
      ? school.isAdminApproved ||
        school.isPartner ||
        isNewSchoolEligibilityApproved()
      : school.isAdminApproved || school.isPartner)
  )

  function isNewSchoolEligibilityApproved() {
    return (
      isTitle1Eligible() ||
      hasCEONationalSchoolLunch() ||
      hasFreeReducedLunchAboveThreshold(config.eligibleFRLThreshold)
    )
  }

  function isTitle1Eligible() {
    return school?.isSchoolWideTitle1 || school?.isTitle1Eligible
  }

  function hasCEONationalSchoolLunch() {
    return (
      school?.nationalSchoolLunchProgram ===
      'Yes under Community Eligibility Option (CEO)'
    )
  }

  function hasFreeReducedLunchAboveThreshold(thresholdPercentage: number) {
    if (!school || !school.totalStudents) {
      return false
    }
    const freeReducedLunchStudents = Math.max(
      school?.nslpDirectCertification ?? 0,
      school?.frlEligible ?? 0
    )
    return freeReducedLunchStudents / school.totalStudents > thresholdPercentage
  }
}
