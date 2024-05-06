import * as UserCtrl from '../controllers/UserCtrl'
import { getSchoolById } from '../models/School/queries'
import { getZipCodeByZipCode } from '../models/ZipCode/queries'
import {
  getIneligibleStudentByEmail,
  insertIneligibleStudent,
} from '../models/IneligibleStudent/queries'
import { getUserIdByEmail } from '../models/User/queries'
import { asFactory, asString, asEnum, asOptional } from '../utils/type-utils'
import { GRADES } from '../constants'
import { CustomError } from 'ts-custom-error'
import { School } from '../models/School'
import { ZipCode } from '../models/ZipCode'
import config from '../config'

type CheckEligibilityPayload = {
  email: string
  gradeLevel?: GRADES
  referredByCode?: string
  schoolId?: string
  zipCode: string
  // == Remove after high-line clean-up.
  currentGrade?: GRADES
  schoolUpchieveId?: string
}
const asCheckEligibilityPayload = asFactory<CheckEligibilityPayload>({
  email: asString,
  gradeLevel: asOptional(asEnum(GRADES)),
  referredByCode: asOptional(asString),
  schoolId: asOptional(asString),
  zipCode: asString,
  // == Remove after high-line clean-up.
  currentGrade: asOptional(asEnum(GRADES)),
  schoolUpchieveId: asOptional(asString),
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
    email,
    gradeLevel,
    referredByCode,
    schoolId,
    zipCode: zipCodeInput,
    // == Remove after high-line clean-up.
    currentGrade,
    schoolUpchieveId,
  } = asCheckEligibilityPayload(payload)

  if (email) {
    const existingUser = await getUserIdByEmail(email)
    if (existingUser) throw new ExistingUserError()
  }

  // == Remove after high-line clean-up.
  const isCollegeStudent =
    currentGrade === GRADES.COLLEGE || gradeLevel === GRADES.COLLEGE

  if (email) {
    const existingIneligible = await getIneligibleStudentByEmail(email)
    if (existingIneligible) {
      return { isEligible: false, isCollegeStudent }
    }
  }

  // == Remove after high-line clean-up.
  const school =
    schoolUpchieveId || schoolId
      ? await getSchoolById(schoolUpchieveId ?? schoolId ?? '')
      : undefined
  const zipCode = zipCodeInput
    ? await getZipCodeByZipCode(zipCodeInput)
    : undefined

  const isEligibleBySchool = isSchoolApproved(school)
  const isEligibleByZipCode = isZipCodeEligible(zipCode)
  const isStudentEligible =
    (isEligibleBySchool || isEligibleByZipCode) && !isCollegeStudent

  if (!isStudentEligible) {
    const referredBy = await UserCtrl.checkReferral(referredByCode)
    if (email) {
      await insertIneligibleStudent(
        email,
        school?.id,
        zipCodeInput,
        // == Remove after high-line clean-up.
        currentGrade ?? gradeLevel,
        referredBy,
        ip
      )
    }
  }

  return {
    isEligible: isStudentEligible,
    isCollegeStudent,
  }
}

export async function verifyEligibility(
  zipCode?: string,
  schoolUpchieveId?: string
) {
  const school = schoolUpchieveId
    ? await getSchoolById(schoolUpchieveId)
    : undefined
  const zipCodeData = zipCode ? await getZipCodeByZipCode(zipCode) : undefined
  return isSchoolApproved(school) || isZipCodeEligible(zipCodeData)
}

export async function checkZipCode(param: unknown): Promise<boolean> {
  const zipCode = asString(param)
  const foundZip = await getZipCodeByZipCode(zipCode)
  return !!foundZip
}

function isZipCodeEligible(zipCode?: ZipCode) {
  return !!zipCode && zipCode.isEligible
}

export function isSchoolApproved(school?: School) {
  return (
    !!school &&
    (school.isAdminApproved ||
      school.isPartner ||
      isNewSchoolEligibilityApproved())
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
