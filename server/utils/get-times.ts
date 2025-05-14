import moment from 'moment'
import 'moment-timezone'

export function getCurrentNewYorkTime() {
  return moment().utc().tz('America/New_York')
}

export function getMostRecentSunday() {
  const now = new Date()
  // .getDay() returns the day of the week (0-6) where 0 is Sunday
  const dayOfWeek = now.getDay()

  // .getDate() returns the day of the month (1-31)
  const dateOfMonth = now.getDate()

  // by subtracting the day of the week from the day of the month,
  // we get the most recent 0 day which is Sunday
  const mostRecentSundayTimestamp = new Date().setDate(dateOfMonth - dayOfWeek)
  return new Date(mostRecentSundayTimestamp)
}
