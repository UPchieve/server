import type {
  CheckEligibilityPublic,
  IneligibleStudentsWithSchoolInfoPublic,
  StudentSignupSourcesPublic,
  ZipCodePublic,
} from '../contracts/eligibility'
import type { IneligibleStudentsWithSchoolInfo } from '../models/IneligibleStudent'
import { StudentSignupSources } from '../models/Student'
import type { ZipCode } from '../models/ZipCode'
import type { CheckEligibility } from '../services/EligibilityService'

export function toCheckEligibilityPublic(
  eligibility: CheckEligibility
): CheckEligibilityPublic {
  return {
    message: eligibility.message,
    isEligible: eligibility.isEligible,
    isCollegeStudent: eligibility.isCollegeStudent,
    isExistingUser: eligibility.isExistingUser,
  }
}

export function toIneligibleStudentsWithSchoolInfoPublic(
  student: IneligibleStudentsWithSchoolInfo
): IneligibleStudentsWithSchoolInfoPublic {
  return {
    email: student.email,
    zipCode: student.zipCode,
    medianIncome: student.medianIncome,
    schoolId: student.schoolId,
    schoolName: student.schoolName,
    schoolState: student.schoolState,
    schoolCity: student.schoolCity,
    schoolZipCode: student.schoolZipCode,
    isApproved: student.isApproved,
    ipAddress: student.ipAddress,
    createdAt: student.createdAt.toISOString(),
  }
}

export function toZipCodePublic(zipCode: ZipCode): ZipCodePublic {
  return {
    zipCode: zipCode.zipCode,
    medianIncome: zipCode.medianIncome,
    cbsaIncome: zipCode.cbsaIncome,
    stateIncome: zipCode.stateIncome,
    isEligible: zipCode.isEligible,
  }
}

export function toStudentSignupSourcePublic(
  source: StudentSignupSources
): StudentSignupSourcesPublic {
  return {
    id: source.id,
    name: source.name,
  }
}
