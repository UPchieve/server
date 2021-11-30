import mongoose from 'mongoose'
import * as db from '../db'
import SessionModel from '../models/Session'
import { USER_SESSION_METRICS } from '../constants'
import { METRIC_PROCESSORS } from '../services/UserSessionMetricsService/metrics'
import { calculateTimeTutored } from '../utils/session-utils'
import { updateTimeTutored } from '../models/Volunteer/queries'
import { getIdFromModelReference } from '../utils/model-reference'
import UserSessionMetricsModel from '../models/UserSessionMetrics'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const affectedStudents = []
    const affectedVolunteers = []
    
    const studentSessions = await SessionModel.find({
      flags: USER_SESSION_METRICS.absentStudent,
    })
    for (const session of studentSessions) {
      const uv = METRIC_PROCESSORS.AbsentStudent.computeUpdateValue({ session })
      // sessions affected by bug have flag when correct code would not have flagged
      // TODO: the below needs to be transactional
      if (!uv) {
        affectedStudents.push(getIdFromModelReference(session.student))
        affectedVolunteers.push(getIdFromModelReference(session.volunteer))
        const timeTutored = calculateTimeTutored(session)
        // update session flag and time tutored and review reason
        await SessionModel.updateOne({ _id: session._id }, 
          { 
            $pull: { flags: USER_SESSION_METRICS.absentStudent, reviewReasons: USER_SESSION_METRICS.absentStudent },
            timeTutored
          }
        )
        // update volunteer time tutored
        await updateTimeTutored(getIdFromModelReference(session.volunteer), timeTutored)
        // update USMs
        await UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.student) },
          {
            $increment: { 'counters.absentStudent': -1 }
          }
        )
        await UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.volunteer) },
          {
            $increment: { 'counters.absentStudent': -1 }
          }
        )
      }
    }

    const volunteerSessions = await SessionModel.find({
      flags: USER_SESSION_METRICS.absentVolunteer,
    })
    for (const session of volunteerSessions) {
      const uv = METRIC_PROCESSORS.AbsentStudent.computeUpdateValue({ session })
      // TODO: the below needs to be transactional
      // sessions affected by bug have flag when correct code would not have flagged
      if (!uv) {
        affectedStudents.push(getIdFromModelReference(session.student))
        affectedVolunteers.push(getIdFromModelReference(session.volunteer))
        const timeTutored = calculateTimeTutored(session)
        // update session flag and time tutored and review reason
        await SessionModel.updateOne({ _id: session._id }, 
          { 
            $pull: { flags: USER_SESSION_METRICS.absentVolunteer, reviewReasons: USER_SESSION_METRICS.absentVolunteer },
            timeTutored
          }
        )
        // update volunteer time tutored
        await updateTimeTutored(getIdFromModelReference(session.volunteer), timeTutored)
        // update USMs
        await UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.student) },
          {
            $increment: { 'counters.absentVolunteer': -1 }
          }
        )
        await UserSessionMetricsModel.updateOne({ user: getIdFromModelReference(session.volunteer) },
          {
            $increment: { 'counters.absentVolunteer': -1 }
          }
        )
      }
    }
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
