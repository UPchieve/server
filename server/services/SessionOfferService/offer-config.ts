import { minutesInMs, secondsInMs } from '../../utils/time-utils'

// every offer must close within this long of offering starting
export const OFFERING_PERIOD_MS = minutesInMs(2)

// the time the coach has to respond
export const OFFER_DURATION_MS = secondsInMs(10)

// of the sessions that can be offered, the share that are. the rest are listed
// for every coach, so coaches in the control group still have sessions to take
export const OFFERED_SESSION_SHARE = 0.5
