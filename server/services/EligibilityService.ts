import * as UserCtrl from '../controllers/UserCtrl'
import { getSchoolById } from '../models/School/queries'
import { getZipCodeByZipCode } from '../models/ZipCode/queries'
import {
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

type CheckEligibilityPayload = {
  schoolUpchieveId: string
  zipCode: string
  email: string
  referredByCode?: string
  currentGrade?: GRADES
  useNewZipsEligibility?: boolean
}
const asCheckEligibilityPayload = asFactory<CheckEligibilityPayload>({
  schoolUpchieveId: asString,
  zipCode: asString,
  email: asString,
  referredByCode: asOptional(asString),
  currentGrade: asOptional(asEnum(GRADES)),
  useNewZipsEligibility: asOptional(asBoolean),
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
    useNewZipsEligibility,
  } = asCheckEligibilityPayload(payload)

  const existingUser = await getUserIdByEmail(email)
  if (existingUser) throw new ExistingUserError()

  const existingIneligible = await getIneligibleStudentByEmail(email)
  if (existingIneligible) return { isEligible: false }

  const school = await getSchoolById(schoolUpchieveId)
  const zipCode = await getZipCodeByZipCode(zipCodeInput)

  const isSchoolApproved = !!school && school.isAdminApproved
  const isZipCodeEligible =
    !!zipCode &&
    (useNewZipsEligibility ? zipCode.isEligible : zipCode.isEligibleOld)
  const isCollegeStudent = currentGrade === GRADES.COLLEGE ? true : false
  const isStudentEligible =
    (isSchoolApproved || isZipCodeEligible) && !isCollegeStudent

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
  }

  if (isCollegeStudent)
    return {
      isEligible: isStudentEligible,
      isCollegeStudent: isCollegeStudent,
    }
  else return { isEligible: isStudentEligible }
}

export async function checkZipCode(param: unknown): Promise<boolean> {
  const zipCode = asString(param)
  const foundZip = await getZipCodeByZipCode(zipCode)
  return !!foundZip
}
