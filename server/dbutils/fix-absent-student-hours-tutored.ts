import mongoose from 'mongoose'
import * as db from '../db'
import config from '../config'
import SessionModel from '../models/Session'
import { USER_SESSION_METRICS } from '../constants'
import { METRIC_PROCESSORS } from '../services/UserSessionMetricsService/metrics'
import { calculateTimeTutored } from '../utils/session-utils'
import { updateTimeTutored, updateVolunteerTotalHoursById } from '../models/Volunteer/queries'
import { getIdFromModelReference } from '../utils/model-reference'
import UserSessionMetricsModel from '../models/UserSessionMetrics'
import VolunteerModel from '../models/Volunteer'
import { safeAsync } from '../utils/safe-async'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const affectedSessions = []
    const affectedStudents = []
    const affectedVolunteers = []
    const customVolunteers = []
    const reviewedStudents = []
    
    // there are 0 sessions with Absent Volunteer flag
    const studentSessions = await SessionModel.find({
      createdAt: { $gt: new Date('11/13/21') },
      flags: USER_SESSION_METRICS.absentStudent,
    })
    for (const session of studentSessions) {
      const uv = METRIC_PROCESSORS.AbsentStudent.computeUpdateValue({ session })
      // sessions affected by bug have flag when correct code would not have flagged
      if (session.volunteer && !uv) {
        affectedSessions.push(session._id.toString())
        affectedStudents.push(getIdFromModelReference(session.student).toString())
        affectedVolunteers.push(getIdFromModelReference(session.volunteer).toString())

        // check if user might have been banned
        const usm = await UserSessionMetricsModel.findOne({ user: getIdFromModelReference(session.student) }).lean().exec()
        if (usm && usm.counters.absentStudent >= 4) {
          reviewedStudents.push(getIdFromModelReference(session.student).toString())
        }

        const timeTutored = calculateTimeTutored(session)
        // update session flag and time tutored and review reason
        const updatedSession = await safeAsync(SessionModel.updateOne({ _id: session._id }, 
          { 
            $pull: { flags: USER_SESSION_METRICS.absentStudent, reviewReasons: USER_SESSION_METRICS.absentStudent },
            timeTutored
          }
        ).exec())
        if (updatedSession.error) {
          console.log(`Failed to update session ${session._id} with error ${updatedSession.error} \n cancelling further changes`)
          continue
        }
        // update volunteer time tutored
        const updatedVolunteer = await safeAsync(updateTimeTutored(getIdFromModelReference(session.volunteer), timeTutored))
        if (updatedVolunteer.error) {
          console.log(`Failed to update volunteer ${session.volunteer} with error ${updatedVolunteer.error} \n cancelling further changes`)
          continue
        }

        // add time tutored to totalVolunteerHours for custom partner org - 0 custom partner volunteers were affected
        const volunteer = await VolunteerModel.findOne({ _id: getIdFromModelReference(session.volunteer) }).lean().exec()
        if (volunteer && volunteer.volunteerPartnerOrg && config.customVolunteerPartnerOrgs.includes(volunteer.volunteerPartnerOrg)) {
          customVolunteers.push(getIdFromModelReference(session.volunteer).toString())
          // await updateVolunteerTotalHoursById(getIdFromModelReference(session.volunteer), timeTutored)
        }
        // update USMs
        const updatedStudentUSM = await safeAsync(UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.student) },
          {
            $inc: { 'counters.absentStudent': -1 }
          }
        ).exec())
        if (updatedStudentUSM.error) {
          console.log(`Failed to update USM for ${session.student} with error ${updatedStudentUSM.error}`)
          continue
        }
        const updatedVolunteerUSM = await safeAsync(UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.volunteer) },
          {
            $inc: { 'counters.absentStudent': -1 }
          }
        ).exec())
        if (updatedVolunteerUSM.error) {
          console.log(`Failed to update USM for ${session.volunteer} with error ${updatedVolunteerUSM.error}`)
          continue
        }
      }
    }

    console.log('# Affected sessions:', (new Set(affectedSessions)).size)
    console.log('# Affected students:', (new Set(affectedStudents)).size)
    console.log('# Affected volunteers:', (new Set(affectedVolunteers)).size)
    console.log('# Affected custom:', (new Set(customVolunteers)).size)
    console.log('# Reviewed students:', (new Set(reviewedStudents)).size)
    console.log('Students to review:', Array.from(new Set(reviewedStudents)))
    console.log('Session Ids:', Array.from(new Set(affectedSessions)))
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
