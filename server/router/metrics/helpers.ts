import {
  keys,
  pickBy,
  values,
  flattenDeep,
  meanBy,
  merge,
  map,
  mapValues,
  find,
  flatten,
  filter,
  uniq,
  defaults,
  sumBy,
  orderBy,
  reduce,
  groupBy,
  countBy,
  identity
} from 'lodash'
import { extendMoment } from 'moment-range'

import FeedbackModel from '../../models/Feedback'
const moment = extendMoment(require('moment'))
const Session = require('../../models/Session')
const User = require('../../models/User')

const MIN_MINUTES_FOR_SUCCESSFUL_SESSION = 1
const MAX_SESSION_LENGTH_SECONDS = 3600 * 5 // 5hr
const MIN_SESSION_LENGTH_SECONDS = 60

// timeScale is 'hour' | 'day' | 'week' | 'month' | 'all'
function getScaledTimeByTimeScale(timeScale, time) {
  if (time == null) {
    time = moment.utc()
  }
  if (timeScale === 'all') {
    return 'ALL'
  } else if (timeScale === 'day') {
    return 'DAY:' + time.format('YYYY-MM-DD')
  } else if (timeScale === 'biweek') {
    // 1 - 26 instead of 1 - 52
    return 'BIWK:' + time.format('GGGG') + parseInt(time.format('GGGG-WW')) / 2
  } else if (timeScale === 'week') {
    return 'WK:' + time.format('GGGG-WW')
  } else if (timeScale === 'month') {
    return 'MON:' + time.format('YYYY-MM')
  } else if (timeScale === 'year') {
    return 'YR:' + time.format('YYYY')
  } else {
    return 'MIN:' + time.format('YYYY-MM-DD HH:mm')
  }
}

function objToDatapoints(obj, prop = 'count') {
  return map(obj, (scaledTimes, segmentSlug) => {
    scaledTimes = mapValues(scaledTimes, prop)
    return map(scaledTimes, (count, scaledTime) => {
      return {
        segmentSlug,
        count,
        scaledTime,
        dimensionSlug: 'all',
        dimensionValue: 'all'
      }
    })
  })
}

function deepObjToDatapoints(obj, dimensionSlug = 'all') {
  return flattenDeep(
    map(obj, (scaledTimes, segmentSlug) => {
      scaledTimes = mapValues(scaledTimes, dimensionSlug)
      return map(scaledTimes, (deepObj, scaledTime) => {
        return map(deepObj, (count, dimensionValue) => {
          return {
            segmentSlug,
            count,
            scaledTime,
            dimensionSlug,
            dimensionValue
          }
        })
      })
    })
  )
}

function getPerSegment(rowsWithExtras, fn, timeScale, type = 'all') {
  const studentPartnerGroups = groupBy(
    rowsWithExtras,
    ({ studentPartnerOrg }) => `student-${studentPartnerOrg || 'none'}`
  )
  const volunteerPartnerGroups = groupBy(
    rowsWithExtras,
    ({ volunteerPartnerOrg }) => `volunteer-${volunteerPartnerOrg || 'none'}`
  )
  const studentPartnerStats = mapValues(
    studentPartnerGroups,
    (sessions, studentPartner) => fn(sessions, studentPartner, timeScale)
  )
  const volunteerPartnerStats = mapValues(
    volunteerPartnerGroups,
    (sessions, studentPartner) => fn(sessions, studentPartner, timeScale)
  )
  return merge(
    { '': fn(rowsWithExtras, '', timeScale) },
    type === 'all' || type === 'student' ? studentPartnerStats : {},
    type === 'all' || type === 'volunteer' ? volunteerPartnerStats : {}
  )
}

function getFeedbackStatsPerSegment(
  feedbacksWithExtras,
  segmentSlug,
  timeScale
) {
  // bunch of stuff to conform to datapoint format {scaledTime, dimensionSlug, dimensionValue}
  return reduce(
    feedbacksWithExtras,
    (ratings, feedback) => {
      const scaledTime = getScaledTimeByTimeScale(
        timeScale,
        moment.utc(feedback.createdAt)
      )
      const rating =
        feedback.responseData &&
        feedback.responseData['rate-session'] &&
        feedback.responseData['rate-session'].rating

      if (rating && feedback.type && feedback.subTopic) {
        ratings.topic[feedback.type] = ratings.topic[feedback.type] || {}
        ratings.topic[feedback.type][scaledTime] =
          ratings.topic[feedback.type][scaledTime] || []
        ratings['sub-topic'][feedback.subTopic] =
          ratings['sub-topic'][feedback.subTopic] || {}
        ratings['sub-topic'][feedback.subTopic][scaledTime] =
          ratings['sub-topic'][feedback.subTopic][scaledTime] || []
        ratings.topic[feedback.type][scaledTime].push(rating)
        ratings['sub-topic'][feedback.subTopic][scaledTime].push(rating)
      }
      return ratings
    },
    { topic: {}, 'sub-topic': {} }
  )
}

async function getFeedbackStats(userType, options) {
  const { minTime, maxTime, timeScale = 'day' } = options
  const feedbacks = await FeedbackModel.find({
    userType,
    createdAt: { $gte: minTime, $lte: maxTime }
  })
    .select([
      'createdAt',
      'type',
      'subTopic',
      'responseData',
      'volunteerId',
      'studentId'
    ])
    .lean()

  const allUserIds = filter(
    uniq(
      flatten(
        map(feedbacks, ({ volunteerId, studentId }) => [volunteerId, studentId])
      )
    )
  )
  const allUsers = await User.find({
    _id: { $in: allUserIds }
  })
    .select([
      '_id',
      'studentPartnerOrg',
      'volunteerPartnerOrg',
      'studentId',
      'volunteerId'
    ])
    .lean()

  const feedbacksWithExtras = map(feedbacks, feedback => {
    const student = find(allUsers, { _id: feedback.studentId })
    const volunteer = find(allUsers, { _id: feedback.volunteerId })
    return defaults(
      {
        studentPartnerOrg: student && student.studentPartnerOrg,
        volunteerPartnerOrg: volunteer && volunteer.volunteerPartnerOrg
      },
      feedback
    )
  })

  const stats = getPerSegment(
    feedbacksWithExtras,
    getFeedbackStatsPerSegment,
    timeScale
  )

  const toDatapoints = type => {
    return flattenDeep(
      map(stats, (ratings, segmentSlug) => {
        return map(ratings, (dimensions, dimensionSlug) => {
          return map(dimensions, (scaledTimes, dimensionValue) => {
            const datapoints = map(scaledTimes, (values, scaledTime) => {
              return {
                segmentSlug,
                dimensionSlug,
                dimensionValue,
                count: type === 'sum' ? sumBy(values) : values.length,
                scaledTime
              }
            })
            return orderBy(datapoints, 'scaledTime')
          })
        })
      })
    )
  }

  return { sum: toDatapoints('sum'), count: toDatapoints('count') }
}

function getSessionsWithExtras(sessions, allUsers = undefined) {
  return filter(
    map(sessions, session => {
      const startTime = moment.utc(session.createdAt)
      const endTime = moment.utc(session.endedAt)
      const hasVolunteer = Boolean(session.volunteerJoinedAt)
      let waitSeconds, durationSeconds
      if (hasVolunteer) {
        const matchedTime = moment.utc(session.volunteerJoinedAt)
        waitSeconds = matchedTime.diff(startTime, 'seconds')
        durationSeconds = endTime.diff(matchedTime, 'seconds')
      } else {
        waitSeconds = endTime.diff(startTime, 'seconds')
        durationSeconds = 0
      }

      if (
        waitSeconds > MAX_SESSION_LENGTH_SECONDS ||
        durationSeconds > MAX_SESSION_LENGTH_SECONDS ||
        (durationSeconds < MIN_SESSION_LENGTH_SECONDS && !hasVolunteer)
      ) {
        return // ignore outliers. TODO: smarter approach (based on chat messages)
      }

      const student = find(allUsers, { _id: session.student })
      const volunteer = find(allUsers, { _id: session.volunteer })

      const extras = {
        startTime,
        waitSeconds,
        durationSeconds,
        studentPartnerOrg: student && student.studentPartnerOrg,
        volunteerPartnerOrg: volunteer && volunteer.volunteerPartnerOrg,
        dayOfWeek: startTime.format('ddd'),
        hourOfDay: startTime.format('H'),
        isSuccessful: durationSeconds >= MIN_MINUTES_FOR_SUCCESSFUL_SESSION
      }
      return defaults(extras, session)
    })
  )
}

async function getCumulativeSessions({ minTime, maxTime }) {
  const sessions = await Session.find({
    createdAt: { $lte: maxTime }
  })
    .select([
      'createdAt',
      'volunteerJoinedAt',
      'student',
      'volunteer',
      'endedAt',
      'messages',
      'type',
      'subTopic'
    ])
    .lean()

  const sessionsWithExtras = getSessionsWithExtras(sessions)

  const range = moment.range(minTime, maxTime)
  const rangeArr = Array.from(range.by('day'))
  const allDatapoints = map(rangeArr, date => {
    return {
      segmentSlug: '',
      scaledTime: getScaledTimeByTimeScale('day', date),
      count: filter(sessionsWithExtras, ({ startTime }) => {
        return startTime.isSameOrBefore(date)
      }).length,
      dimensionSlug: 'all',
      dimensionValue: 'all'
    }
  })
  return allDatapoints
}

function getSessionStatsPerSegment(sessionsWithExtras, segmentSlug, timeScale) {
  const sessionGroups = groupBy(sessionsWithExtras, ({ createdAt }) =>
    getScaledTimeByTimeScale(timeScale, moment.utc(createdAt))
  )

  return mapValues(sessionGroups, sessions => {
    const successfulSessions = filter(sessions, 'isSuccessful')
    return {
      count: sessions.length,
      durationSecSum: sumBy(sessions, 'durationSeconds'),
      waitSecSum: sumBy(sessions, 'waitSeconds'),
      messageSum: sumBy(
        sessions,
        ({ messages }) => messages && messages.length
      ),
      successfulMatches: successfulSessions.length,
      'day-of-week': countBy(sessions, 'dayOfWeek'),
      'hour-of-day': countBy(sessions, 'hourOfDay'),
      topic: countBy(sessions, 'type'),
      'sub-topic': countBy(sessions, 'subTopic')
    }
  })
}

async function getSessionStats({ minTime, maxTime, timeScale = 'day' }) {
  const sessions = await Session.find({
    createdAt: { $gte: minTime, $lte: maxTime }
  })
    .select([
      'createdAt',
      'volunteerJoinedAt',
      'student',
      'volunteer',
      'endedAt',
      'messages',
      'type',
      'subTopic'
    ])
    .lean()

  const allUserIds = filter(
    uniq(
      flatten(map(sessions, ({ volunteer, student }) => [volunteer, student]))
    )
  )
  const allUsers = await User.find({
    _id: { $in: allUserIds }
  })
    .select(['_id', 'studentPartnerOrg', 'volunteerPartnerOrg'])
    .lean()

  const sessionsWithExtras = getSessionsWithExtras(sessions, allUsers)

  return getPerSegment(sessionsWithExtras, getSessionStatsPerSegment, timeScale)
}

async function getCumulativeStudents({ minTime, maxTime }) {
  const students = await User.find({
    isVolunteer: false,
    isTestUser: false,
    createdAt: { $lte: maxTime }
  })
    .select(['createdAt', 'zipCode', 'studentPartnerOrg'])
    .lean()

  const studentsWithExtras = map(students, student =>
    defaults({ startTime: moment.utc(student.createdAt) }, student)
  )

  const range = moment.range(minTime, maxTime)
  const rangeArr = Array.from(range.by('day'))
  const allDatapoints = map(rangeArr, date => {
    return {
      segmentSlug: '',
      scaledTime: getScaledTimeByTimeScale('day', date),
      count: filter(studentsWithExtras, ({ startTime }) => {
        return startTime.isSameOrBefore(date)
      }).length,
      dimensionSlug: 'all',
      dimensionValue: 'all'
    }
  })
  return allDatapoints
}

async function getStudentsDatapoints(students, segmentSlug, timeScale) {
  const studentGroups = groupBy(students, ({ createdAt }) =>
    getScaledTimeByTimeScale(timeScale, moment.utc(createdAt))
  )

  return flattenDeep(
    map(studentGroups, (students, scaledTime) => {
      return [
        {
          segmentSlug,
          scaledTime,
          dimensionSlug: 'all',
          dimensionValue: 'all',
          count: students.length
        }
      ].concat(
        filter(
          map(countBy(students, 'zipCode'), (count, zipCode) => {
            if (zipCode !== 'undefined') {
              return [
                {
                  segmentSlug,
                  scaledTime,
                  dimensionSlug: 'zip',
                  dimensionValue: zipCode,
                  count: count
                }
              ]
            }
          })
        ) as Array<any>
      )
    })
  )
}

async function getStudents({ minTime, maxTime, timeScale = 'day' }) {
  const students = await User.find({
    isVolunteer: false,
    isTestUser: false,
    createdAt: { $gte: minTime, $lte: maxTime }
  })
    .select(['createdAt', 'zipCode', 'studentPartnerOrg'])
    .lean()

  const studentPartnerGroups = groupBy(
    students,
    ({ studentPartnerOrg }) => `student-${studentPartnerOrg || 'none'}`
  )
  const allDatapoints = await getStudentsDatapoints(students, '', timeScale)
  const studentPartnerDatapoints = await Promise.all(
    map(studentPartnerGroups, (students, studentPartner) =>
      getStudentsDatapoints(students, studentPartner, timeScale)
    )
  )
  return allDatapoints.concat(flatten(studentPartnerDatapoints))
}

async function getVolunteerDistributionStats(options) {
  const { minTime, maxTime, timeScale = 'day' } = options
  const volunteers = await User.find({
    isVolunteer: true,
    createdAt: { $gte: minTime, $lte: maxTime }
  })
    .select(['createdAt', 'availability', 'certifications'])
    .lean()

  // const calendar = _.reduce(
  //   volunteers,
  //   (calendar, volunteer) => {
  //     _.forEach(volunteer.availability, (hours, day) => {
  //       calendar.days[day] = calendar.days[day] || 0
  //       const hasAvailabilityToday = _.filter(hours).length > 0
  //       if (hasAvailabilityToday) {
  //         calendar.days[day] += 1
  //       }
  //       _.forEach(hours, (isSet, hour) => {
  //         calendar.hours[hour] = calendar.hours[hour] || 0
  //         if (isSet) {
  //           calendar.hours[hour] += 1
  //         }
  //       })
  //     })
  //     return calendar
  //   },
  //   { days: {}, hours: {} }
  // )

  const volunteerGroups = groupBy(volunteers, ({ createdAt }) =>
    getScaledTimeByTimeScale(timeScale, moment.utc(createdAt))
  )

  return flatten(
    map(volunteerGroups, (volunteers, scaledTime) => {
      const allCertifications = flatten(
        map(volunteers, volunteer => {
          return keys(pickBy(volunteer.certifications, 'passed'))
        })
      )

      const certificateCounts = countBy(allCertifications, identity)

      // dayAvailability: _.map(calendar.days, (count, day) => {
      //   return {
      //     dimensionSlug: 'day-of-week',
      //     dimensionValue: day,
      //     count: count,
      //     scaledTime: 'ALL'
      //   }
      // }),
      // hourAvailability: _.map(calendar.hours, (count, hour) => {
      //   return {
      //     dimensionSlug: 'hour-of-day',
      //     dimensionValue: hour,
      //     count: count,
      //     scaledTime: 'ALL'
      //   }
      // }),
      return map(certificateCounts, (count, subject) => {
        return {
          dimensionSlug: 'subject',
          dimensionValue: subject,
          count: count,
          scaledTime: scaledTime
        }
      })
    })
  )
}

function getVolunteerStatsPerSegment(
  volunteersWithExtras,
  segmentSlug,
  timeScale
) {
  const volunteerGroups = groupBy(volunteersWithExtras, ({ createdAt }) =>
    getScaledTimeByTimeScale(timeScale, moment.utc(createdAt))
  )

  return mapValues(volunteerGroups, volunteers => {
    return {
      count: volunteers.length,
      onboardedCount: filter(
        volunteers,
        ({ availableHours, certificationCount }) =>
          availableHours > 0 && certificationCount > 0
      ).length,
      certificationSum: sumBy(volunteers, 'certificationCount'),
      availableHoursAvg: meanBy(volunteers, 'availableHours')
    }
  })
}

async function getVolunteerStats({ minTime, maxTime, timeScale = 'day' }) {
  const volunteers = await User.find({
    isVolunteer: true,
    createdAt: { $gte: minTime, $lte: maxTime }
  })
    .select([
      'createdAt',
      'certifications',
      'isOnboarded',
      'availability',
      'volunteerPartnerOrg'
    ])
    .lean()

  const volunteersWithExtras = map(volunteers, volunteer => {
    const extras = {
      availableHours: sumBy(values(volunteer.availability), hours =>
        sumBy(values(hours), hour => (hour ? 1 : 0))
      ),
      certificationCount: keys(pickBy(volunteer.certifications, 'passed'))
        .length
    }
    return defaults(extras, volunteer)
  })

  return getPerSegment(
    volunteersWithExtras,
    getVolunteerStatsPerSegment,
    timeScale,
    'volunteer'
  )
}

module.exports = {
  getFeedbackStats,
  getCumulativeSessions,
  getSessionStats,
  getCumulativeStudents,
  getStudents,
  getVolunteerDistributionStats,
  getVolunteerStats,
  objToDatapoints,
  deepObjToDatapoints
}
