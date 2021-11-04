import { isEnabled } from 'unleash-client'
import moment from 'moment'
import { Types } from 'mongoose'
import {
  FEATURE_FLAGS,
  GATES_STUDY_PERIOD_START,
  GATES_STUDY_PERIOD_END,
} from '../constants'
import * as UserProductFlagsRepo from '../models/UserProductFlags/queries'
import * as gatesStudyUtils from '../utils/gates-study-utils'
import { isDateWithinRange } from '../utils/is-date-within-range'
import { asObjectId } from '../utils/type-utils'

// registered as listener on session-ended
export async function processGatesQualifiedSession(sessionId: string) {
  const sessionObjectId = asObjectId(sessionId)
  const todaysDate = moment()
    .utc()
    .toDate()
  if (
    isEnabled(FEATURE_FLAGS.GATES_STUDY) ||
    isDateWithinRange(
      todaysDate,
      GATES_STUDY_PERIOD_START,
      GATES_STUDY_PERIOD_END
    )
  ) {
    const data = await gatesStudyUtils.prepareForGatesQualificationCheck(
      sessionObjectId
    )
    if (gatesStudyUtils.isGatesQualifiedSession(data))
      UserProductFlagsRepo.updateUPFGatesQualifiedFlagById(
        data.student._id,
        true
      )
  }
}
