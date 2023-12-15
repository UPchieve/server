test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import {
  resetDb,
  insertVolunteer,
  insertSessionMany,
  insertFeedback,
  insertFeedbackMany,
} from '../../db-utils'
import emailTenSessionMilestone from '../../../worker/jobs/partner-volunteer-emails/emailTenSessionMilestone'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { buildFeedback, buildSession, buildStudent } from '../../generate'
import { FEEDBACK_VERSIONS, USER_SESSION_METRICS } from '../../../constants'
import { FeedbackVersionTwo } from '../../../models/Feedback'

jest.mock('../../../services/MailService')

// TODO: refactor test to mock out DB calls

const mockedMailService = mocked(MailService, true)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Partner volunteer ten session milestone email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send email to partner volunteer', async () => {
    const volunteer = await insertVolunteer()
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
    ]
    await insertSessionMany(sessions)
    await insertFeedback({
      sessionId: sessions[2]._id,
      volunteerId: volunteer._id,
      volunteerFeedback: {
        'session-enjoyable': 4,
      },
      versionNumber: FEEDBACK_VERSIONS.TWO,
      studentId: buildStudent()._id,
    })

    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg,
      },
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${volunteer._id}`
    )
  })

  test('Should not send email to partner volunteer who has left more than 2 low session ratings', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
    ]
    await insertSessionMany(sessions)
    await insertFeedback(buildFeedback({} as FeedbackVersionTwo))
    const feedback = [
      buildFeedback({
        sessionId: sessions[1]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 1,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO as FEEDBACK_VERSIONS,
      }),
      buildFeedback({
        sessionId: sessions[2]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 2,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO,
      }),
      buildFeedback({
        sessionId: sessions[6]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 1,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO,
      }),
    ]
    await insertFeedbackMany(feedback)

    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg,
      },
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  test(`Should not send email to partner volunteer who has sessions flags with ${USER_SESSION_METRICS.absentStudent}`, async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({
        volunteer: volunteer._id,
        timeTutored: twentyMinutes,
        flags: [USER_SESSION_METRICS.absentStudent],
      }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
    ]
    await insertSessionMany(sessions)
    const feedback = [
      buildFeedback({
        sessionId: sessions[1]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 1,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO,
      }),
      buildFeedback({
        sessionId: sessions[2]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 2,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO,
      }),
      buildFeedback({
        sessionId: sessions[6]._id,
        volunteerId: volunteer._id,
        volunteerFeedback: {
          'session-enjoyable': 1,
        },
        versionNumber: FEEDBACK_VERSIONS.TWO,
      }),
    ]
    await insertFeedbackMany(feedback)

    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg,
      },
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  test('Should not send email to partner volunteer who has 5 sessions with one of a duration less than 15 minutes', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
    })
    const tenMinutes = 1000 * 60 * 10
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: tenMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
    ]
    await insertSessionMany(sessions)

    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg,
      },
    }

    await emailTenSessionMilestone(job)
    expect(
      MailService.sendPartnerVolunteerTenSessionMilestone
    ).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  test('Should throw error when sending email fails', async () => {
    const volunteer = await insertVolunteer({
      isOnboarded: true,
      volunteerPartnerOrg: 'example',
    })
    const twentyMinutes = 1000 * 60 * 20
    const thirtyMinutes = 1000 * 60 * 30
    const sessions = [
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: thirtyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
      buildSession({ volunteer: volunteer._id, timeTutored: twentyMinutes }),
    ]
    await insertSessionMany(sessions)
    await insertFeedback({
      sessionId: sessions[2]._id,
      studentId: buildStudent()._id,
      volunteerId: volunteer._id,
      volunteerFeedback: {
        'session-enjoyable': 4,
      },
      versionNumber: FEEDBACK_VERSIONS.TWO,
    } as FeedbackVersionTwo)
    const errorMessage = 'Unable to send'
    mockedMailService.sendPartnerVolunteerTenSessionMilestone.mockRejectedValueOnce(
      errorMessage
    )
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
      data: {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
        partnerOrg: volunteer.volunteerPartnerOrg,
      },
    }

    await expect(emailTenSessionMilestone(job)).rejects.toEqual(
      Error(
        `Failed to send ${job.name} to volunteer ${volunteer._id}: ${errorMessage}`
      )
    )
  })
})
*/
