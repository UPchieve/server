import { minutesInMs, secondsInMs } from '../../utils/time-utils'

// every offer must close within this long of offering starting
export const OFFERING_PERIOD_MS = minutesInMs(2)

// the time the coach has to respond
export const OFFER_DURATION_MS = secondsInMs(15)
