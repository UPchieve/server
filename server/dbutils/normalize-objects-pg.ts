import mongoose, { Types } from 'mongoose'
import * as db from '../db'
import moment from 'moment'

import NotificationModel from '../models/Notification'
import SurveyModel from '../models/Survey'
import SessionModel, { Session } from '../models/Session'
import { USER_SESSION_METRICS, SESSION_REPORT_REASON } from '../constants'

type WhichAbsent = {
  student: boolean,
  volunteer: boolean
}
function whichAbsent(session: Session): WhichAbsent {
  if (!(session.volunteerJoinedAt && session.volunteer)) return { student: false, volunteer: false }

  let flagStudent = true
  let flagVolunteer = true

  const volunteerMaxWait = moment(session.volunteerJoinedAt).add(10,'minutes')
  // if volunteer waits for less than 10 minutes, do not flag student bc student did not get a chance to respond within wait period
  if (moment(session.endedAt).isSameOrBefore(volunteerMaxWait)) flagStudent = false

  const studentMaxWait = moment(session.volunteerJoinedAt).add(5, 'minutes')
  //if student waits for less than 5 minutes, then not flag volunteer
  if (moment(session.endedAt).isSameOrBefore(studentMaxWait)) flagVolunteer = false

  for (const msg of session.messages) {
    if (
      (msg.user as Types.ObjectId).equals(session.student as Types.ObjectId) &&
      // if student sends message after volunteer joined, then don't flag student
      moment(msg.createdAt).isAfter(session.volunteerJoinedAt)
    ) flagStudent = false
    if (
      // if volunteer sends message, then don't flag volunteer
      (msg.user as Types.ObjectId).equals(session.volunteer as Types.ObjectId)
    ) flagVolunteer = false
  }

  return { student: flagStudent, volunteer: flagVolunteer }
}

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    // clean notification priority groups
    const all15 = await NotificationModel.updateMany(
      {
        priorityGroup: 'All volunteers - Not notified in last 15 mins'
      },
      {
        priorityGroup: 'All volunteers - not notified in the last 15 mins'
      }
    ).exec()
    if (!all15.acknowledged) console.error('Did not update priority group: All volunteers - Not notified in last 15 mins')
    const partner3 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Partner volunteers - Not notified in last 3 days'
      },
      {
        priorityGroup: 'Partner volunteers - not notified in the last 3 days'
      }
    ).exec()
    if (!partner3.acknowledged) console.error('Did not update priority group: Partner volunteers - Not notified in last 3 days')
    const regular7 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Regular volunteers - Not notified in last 7 days'
      },
      {
        priorityGroup: 'Regular volunteers - not notified in the last 7 days'
      }
    ).exec()
    if (!regular7.acknowledged) console.error('Did not update priority group: Regular volunteers - Not notified in last 7 days')

    // clean pre-session surveys
    const sessionsWithTwoSurveys = await SurveyModel.aggregate([
      {
        $group: {
          _id: '$session',
          total: { $sum: 1 }
        }
      },
      {
        $match: {
          total: { $gt: 1 }
        }
      }
    ]).exec()
    for (const session of sessionsWithTwoSurveys) {
      const surveys = await SurveyModel.find({ session }).lean().exec()
      const last = surveys.sort((x, y) => x.createdAt < y.createdAt ? -1: 1).pop()
      const result = await SurveyModel.deleteOne({ _id: last?._id }).lean().exec()
      if (result.deletedCount !== 1) console.error('Did not delete duplicate survey for session: ', last?._id.toString())
    }

    // clean session flags
    const pullOldFlags = await SessionModel.updateMany(
      {
        flags: { $in: [
          'FIRST_TIME_VOLUNTEER',
          'COMMENT',
          'LOW_MESSAGES',
          'FIRST_TIME_STUDENT'
        ] }
      },
      {
        $pull: { flags: { $in: [
          'FIRST_TIME_VOLUNTEER',
          'COMMENT',
          'LOW_MESSAGES',
          'FIRST_TIME_STUDENT'
        ] } }
      }
    ).exec()
    if (!pullOldFlags.acknowledged) console.error('Did not pull old session flags')

    const volunteerRating = await SessionModel.updateMany(
      {
        flags: { $in: [ 'VOLUNTEER_RATING' ] }
      },
      {
        $addToSet: { flags: [ USER_SESSION_METRICS.lowSessionRatingFromCoach ] }
      }
    ).exec()
    if (!volunteerRating.acknowledged) console.error('Did not add new volunteer rating flag')
    const volunteerRatingDelete = await SessionModel.updateMany(
      {
        flags: { $in: [ 'VOLUNTEER_RATING' ] }
      },
      {
        $pull: { flags: { $in: [ 'VOLUNTEER_RATING' ] } },
      }
    ).exec()
    if (!volunteerRatingDelete.acknowledged) console.error('Did not delete old volunteer rating flag')

    const unmatched = await SessionModel.updateMany(
      {
        flags: { $in: [ 'UNMATCHED' ] }
      },
      {
        $addToSet: { flags: [ USER_SESSION_METRICS.hasBeenUnmatched ] }
      }
    ).exec()
    if (!unmatched.acknowledged) console.error('Did add new unmatched flag')
    const unmatchedDelete = await SessionModel.updateMany(
      {
        flags: { $in: [ 'UNMATCHED' ] }
      },
      {
        $pull: { flags: { $in: [ 'UNMATCHED' ] } },
      }
    ).exec()
    if (!unmatchedDelete.acknowledged) console.error('Did not delete old unmatched flag')

    const reported = await SessionModel.updateMany(
      {
        flags: { $in: [ 'REPORTED' ] }
      },
      {
        $addToSet: { flags: [ USER_SESSION_METRICS.reported ] }
      }
    ).exec()
    if (!reported.acknowledged) console.error('Did not add new reported flag')
    const reportedDelete = await SessionModel.updateMany(
      {
        flags: { $in: [ 'REPORTED' ] }
      },
      {
        $pull: { flags: { $in: [ 'REPORTED' ] } },
      }
    ).exec()
    if (!reportedDelete.acknowledged) console.error('Did not delete old reported flag')

    const absentSessions = await SessionModel.find({
      flags: { $in: [ 'ABSENT_USER' ] }
    }).lean().exec()
    for (const session of absentSessions) {
      const { student, volunteer } = whichAbsent(session)
      const flags = []
      if (student) flags.push(USER_SESSION_METRICS.absentStudent)
      if (volunteer) flags.push(USER_SESSION_METRICS.absentVolunteer)
      if (flags.length) {
        const update = {
          $addToSet: { flags: flags }
        }
        const result = await SessionModel.updateOne({ _id: session._id }, update).exec()
        if (!result.acknowledged) console.error('Did not add new absent flags for session: ', session._id.toString())
      }
    }
    const deleteOldAbsent = await SessionModel.updateMany({
      flags: { $in: [ 'ABSENT_USER' ] }
    }, {
      $pull: { flags: { $in: [ 'ABSENT_USER' ] } }, 
    }).exec()
    if (!deleteOldAbsent.acknowledged) console.error('Did not delete old absent flag')

    const studentRatingSessions = await SessionModel.aggregate([
      {
        $match: {
          flags: { $in: [ 'STUDENT_RATING' ] }
        }
      }, 
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'sessionId',
          as: 'feedback'
        }
      },
      {
        $unwind: '$feedback'
      },
      {
        $match: {
          'feedback.userType': 'student'
        }
      }
    ]).exec()
    for (const session of studentRatingSessions) {
      const flags = []
      if (session.feedback && session.feedback.versionNumber === 2) {
        const feedback = session.feedback
        if (
          feedback.studentTutoringFeedback &&
          feedback.studentTutoringFeedback['coach-rating']! <= 2
        )
          flags.push(USER_SESSION_METRICS.lowCoachRatingFromStudent)
        else if (
          feedback.studentCounselingFeedback &&
          feedback.studentCounselingFeedback['coach-ratings']
        ) {
          for (const value of Object.values(
            feedback.studentCounselingFeedback['coach-ratings']
          )) {
            if ((value as number) <= 2) flags.push(USER_SESSION_METRICS.lowCoachRatingFromStudent)
          }
        }
        if (
          feedback.studentTutoringFeedback &&
          feedback.studentTutoringFeedback['session-goal']! <= 2
        )
          flags.push(USER_SESSION_METRICS.lowSessionRatingFromCoach)
        else if (
          feedback.studentCounselingFeedback &&
          feedback.studentCounselingFeedback['rate-session'] &&
          feedback.studentCounselingFeedback['rate-session'].rating! <= 2
        )
          flags.push(USER_SESSION_METRICS.lowSessionRatingFromCoach)
      }
      if (flags.length) {
        const update = {
          $addToSet: { flags: flags }
        }
        const result = await SessionModel.updateOne({ _id: session._id }, update).exec()
        if (!result) console.error('Did not update student rating flag for session: ', session._id.toString())
      }
    }
    const deleteOldRating = await SessionModel.updateMany({
        flags: { $in: [ 'STUDENT_RATING' ] }
      },
      { $pull: { flags: { $in: [ 'STUDENT_RATING' ] } } },
    ).exec()
    if (!deleteOldRating.acknowledged) console.error('Did not delete old rating flags')

    // clean up report reasons
    const reportOther = await SessionModel.updateMany(
      {
        reportReason: 'Other'
      },
      {
        reportReason: 'LEGACY: Other'
      }
    )
    if (!reportOther.acknowledged) console.error('Did not add new Other to report reasons')

    const reportRude = await SessionModel.updateMany(
      {
        reportReason: { $in: [ 'Student was rude', 'Student was misusing platform' ] }
      },
      {
        reportReason: SESSION_REPORT_REASON.STUDENT_RUDE
      }
    )
    if (!reportRude.acknowledged) console.error('Did not add new Rude to report reasons')

    const reportTech = await SessionModel.updateMany(
      {
        reportReason: 'Technical issue'
      },
      {
        reportReason: 'LGECACY: Technical issue'
      }
    )
    if (!reportTech.acknowledged) console.error('Did not add new Tech to report reasons')

    const reportUnresponsive = await SessionModel.updateMany(
      {
        reportReason: 'Student was unresponsive'
      },
      {
        reportReason: 'LGECACY: Student was unresponsive'
      }
    )
    if (!reportUnresponsive.acknowledged) console.error('Did not add new Unresponsive to report reasons')

  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
