/*
 * This script calculates a match rate based on a given minimum student wait time
 */

const mongoose = require('mongoose')
const async = require('async')

const dbconnect = require('./dbconnect')

const User = require('../models/User')
const Session = require('../models/Session')

dbconnect(mongoose, function () {
  async.waterfall([
    function (done) {
      Session.find({
        createdAt: { $exists: true },
        endedAt: { $exists: true }
      })
        .select('createdAt endedAt volunteerJoinedAt')
        .populate('student')
        .exec()
        .then((sessions) => {
          done(null, sessions)
        })
    },
    function (sessions, done) {
      if (process.argv[2] && isNaN(parseFloat(process.argv[2]))) {
        console.error('The minStudentWaitTime you entered is not valid. Please provide a number (of minutes)')
        return done(new Error('invalid minStudentWaitTime argument'))
      }

      if (process.argv[3] && isNaN(Date.parse(process.argv[3]))) {
        console.error('The startDate you provided is not valid. Please use a valid date format such as mm/dd/yy')
        return done(new Error('invalid startDate argument'))
      }

      const minStudentWaitTime = process.argv[2] ? parseFloat(process.argv[2]) : 5
      const startDate = process.argv[3] ? new Date(process.argv[3]) : new Date('9/1/19')

      const sessionSet = sessions.filter((s) => {
        const student = s.student
        const isRealStudent = !(student.isTestUser || student.isFakeUser)
        const isInTimeFrame = new Date(s.createdAt) > startDate

        return isRealStudent && isInTimeFrame
      })

      const studentLeftEarly = sessionSet.filter((s) => {
        if (s.volunteerJoinedAt && new Date(s.volunteerJoinedAt) < new Date(s.endedAt)) {
          return false
        }

        // Minutes a student waited for volunteer before ending the session
        const waitTime = (new Date(s.endedAt) - new Date(s.createdAt)) / 60000
        return waitTime < minStudentWaitTime
      })

      const validSessions = sessionSet.filter((s) => {
        return studentLeftEarly.indexOf(s) === -1
      })

      const validSessionsMatched = validSessions.filter((s) => {
        return (s.volunteerJoinedAt && new Date(s.volunteerJoinedAt) < new Date(s.endedAt))
      })

      const percentValidSessionsMatched = ((validSessionsMatched.length / validSessions.length) * 100).toFixed(2)

      console.log('========================================================')
      console.log(`Matched ${percentValidSessionsMatched}% of sessions after ${startDate.toDateString()} when students waited at least ${minStudentWaitTime} minutes`)
      console.log(`That's ${validSessionsMatched.length} matched out of ${validSessions.length} valid sessions.`)
      console.log('========================================================')

      done()
    }
  ],
  function (err) {
    if (err) {
      console.log(err)
    }
    mongoose.disconnect()
  })
})
