import { isEnabled } from 'unleash-client'
import { FEATURE_FLAGS } from '../constants'
import * as UserProductFlagsRepo from '../models/UserProductFlags'
import * as gatesStudyUtils from '../utils/gates-study-utils'

// registered as listener on session-ended
export async function processGatesQualifiedSession(sessionId: string) {
  const todaysDate = new Date()
  if (
    isEnabled(FEATURE_FLAGS.GATES_STUDY) ||
    gatesStudyUtils.isDateWithinGatesStudyPeriod(todaysDate)
  ) {
    const data = await gatesStudyUtils.prepareForGatesQualificationCheck(
      sessionId
    )
    if (gatesStudyUtils.isGatesQualifiedSession(data))
      UserProductFlagsRepo.updateGatesQualifiedFlag(data.student._id, true)
  }
}
