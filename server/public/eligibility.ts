import { CheckEligibilityPublic } from '../contracts/eligibility'
import { CheckEligibility } from '../services/EligibilityService'

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
