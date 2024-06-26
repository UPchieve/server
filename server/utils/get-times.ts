import moment from 'moment'
import 'moment-timezone'

export function getCurrentNewYorkTime() {
  return moment()
    .utc()
    .tz('America/New_York')
}
