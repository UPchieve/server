import { Request, Response, Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSApplicationService from '../../services/NTHSApplicationService'
import { toNTHSCandidateApplicationPublic } from '../../public/nths'
import type {
  NTHSApplicationEligibilityResponse,
  NTHSCandidateApplicationResponse,
} from '../../contracts/nths-application'
import {
  asEnum,
  asFactory,
  asObject,
  asOptional,
  asUuid,
} from '../../utils/type-utils'
import { GRADES } from '../../constants/user'

// An applicant whose school is not in the dropdown describes it under
// unlistedSchool instead; the service requires one of the two and is what checks
// the shape of the details.
export const asSubmitNTHSApplicationPayload = asFactory<{
  schoolId?: string
  unlistedSchool?: Record<string, unknown>
  gradeLevel: GRADES
  responses: Record<string, unknown>
}>({
  schoolId: asOptional(asUuid),
  unlistedSchool: asOptional(asObject),
  gradeLevel: asEnum(GRADES),
  responses: asObject,
})

export function routeNTHSApplication(router: Router): void {
  router
    .route('/nths-application')
    .post(
      async (req: Request, res: Response<NTHSCandidateApplicationResponse>) => {
        try {
          const user = extractUser(req)
          const payload = asSubmitNTHSApplicationPayload(req.body)
          const application =
            await NTHSApplicationService.submitCandidateApplication({
              userId: user.id,
              schoolId: payload.schoolId,
              unlistedSchool: payload.unlistedSchool,
              gradeLevel: payload.gradeLevel,
              responses: payload.responses,
            })
          res.json({
            application: toNTHSCandidateApplicationPublic(application),
          })
        } catch (error) {
          resError(res, error)
        }
      }
    )

  router
    .route('/nths-application/eligibility')
    .get(
      async (
        req: Request,
        res: Response<NTHSApplicationEligibilityResponse>
      ) => {
        try {
          const user = extractUser(req)
          const { eligible, reasons, currentGradeName } =
            await NTHSApplicationService.getApplicationEligibility(user.id)
          res.json({
            eligible,
            reasons:
              NTHSApplicationService.clientSafeIneligibilityReasons(reasons),
            currentGradeName,
          })
        } catch (error) {
          resError(res, error)
        }
      }
    )
}
