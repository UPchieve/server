test.todo('postgres migration')
/*import mongoose from 'mongoose'
import moment from 'moment'
import 'moment-timezone'
import * as VolunteerService from '../../services/VolunteerService'
import { resetDb } from '../db-utils'
import {
  buildVolunteer,
  buildSession,
  buildAvailabilityHistory,
  buildUserAction,
  buildAvailabilityDay,
} from '../generate'
import SessionModel from '../../models/Session'
import AvailabilityHistoryModel from '../../models/Availability/History'
import UserActionModel from '../../models/UserAction'
import { STATUS, PHOTO_ID_STATUS, USER_ACTION } from '../../constants'
jest.setTimeout(1000 * 15)

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

describe('getHourSummaryStats', () => {
  test('Should get hour summary stats for one week', async () => {
    const { _id: volunteerId } = buildVolunteer()
    const timeTutoredOneMin = 60000
    const timeTutoredTwoMins = 120000
    const action = USER_ACTION.QUIZ.PASSED
    const actionType = USER_ACTION.TYPE.QUIZ
    const today = new Date('12/21/2020')
    // last week: 12/13/2020 to 12/19/2020
    const startOfLastWeek = moment(today)
      .utc()
      .subtract(1, 'weeks')
      .startOf('week')
      .toDate()
    const endOfLastWeek = moment(today)
      .utc()
      .subtract(1, 'weeks')
      .endOf('week')
      .toDate()

    await SessionModel.insertMany([
      buildSession({
        createdAt: new Date('12/10/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredOneMin,
      }),
      buildSession({
        createdAt: new Date('12/14/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredTwoMins,
      }),
      buildSession({
        createdAt: new Date('12/21/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredOneMin,
      }),
      buildSession({
        createdAt: new Date('12/25/2020'),
        volunteer: volunteerId,
        timeTutored: timeTutoredTwoMins,
      }),
    ])

    await AvailabilityHistoryModel.insertMany([
      buildAvailabilityHistory({
        date: new Date('12/12/2020'),
        volunteerId,
        availability: buildAvailabilityDay({ '4p': true, '5p': true }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/13/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10a': true,
          '11a': true,
          '12p': true,
          '4p': true,
        }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/14/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10a': true,
        }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/15/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10p': true,
          '11p': true,
        }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/16/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '2p': true,
        }),
      }),
    ])

    await UserActionModel.insertMany([
      buildUserAction({
        createdAt: new Date('12/01/2020'),
        action,
        actionType,
        user: volunteerId,
      }),
      buildUserAction({
        createdAt: new Date('12/14/2020'),
        action,
        actionType,
        user: volunteerId,
      }),
      buildUserAction({
        createdAt: new Date('12/21/2020'),
        action,
        actionType,
        user: volunteerId,
      }),
      buildUserAction({
        createdAt: new Date('12/25/2020'),
        action,
        actionType,
        user: volunteerId,
      }),
    ])

    const results = await VolunteerService.getHourSummaryStats(
      volunteerId,
      startOfLastWeek,
      endOfLastWeek
    )
    const expectedStats = {
      totalQuizzesPassed: 1,
      totalElapsedAvailability: 8,
      totalCoachingHours: 0.03,
      // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
      totalVolunteerHours: 0.03 + 1 + 8 * 0.1,
    }

    expect(results).toMatchObject(expectedStats)
  })
})

describe('getPendingVolunteerApprovalStatus', () => {
  test('Should not approve a volunteer if the volunteer only has one reference', () => {
    const photoIdStatus = PHOTO_ID_STATUS.APPROVED
    const referenceStatus = [STATUS.APPROVED]
    const completedBackgroundInfo = true
    const result = VolunteerService.getPendingVolunteerApprovalStatus(
      photoIdStatus,
      referenceStatus,
      completedBackgroundInfo
    )

    expect(result).toBeFalsy()
  })

  test(`Should not approve a volunteer if a reference status is not ${STATUS.APPROVED}`, () => {
    const photoIdStatus = PHOTO_ID_STATUS.APPROVED
    const referenceStatus = [STATUS.APPROVED, STATUS.SUBMITTED]
    const completedBackgroundInfo = true
    const result = VolunteerService.getPendingVolunteerApprovalStatus(
      photoIdStatus,
      referenceStatus,
      completedBackgroundInfo
    )

    expect(result).toBeFalsy()
  })

  test(`Should not approve a volunteer if the photo ID status is not ${STATUS.APPROVED}`, () => {
    const photoIdStatus = STATUS.REJECTED
    const referenceStatus = [STATUS.APPROVED, STATUS.APPROVED]
    const completedBackgroundInfo = true
    const result = VolunteerService.getPendingVolunteerApprovalStatus(
      photoIdStatus,
      referenceStatus,
      completedBackgroundInfo
    )

    expect(result).toBeFalsy()
  })

  test('Should not approve a volunteer if their background info form is not complete', () => {
    const photoIdStatus = STATUS.APPROVED
    const referenceStatus = [STATUS.APPROVED, STATUS.APPROVED]
    const completedBackgroundInfo = false
    const result = VolunteerService.getPendingVolunteerApprovalStatus(
      photoIdStatus,
      referenceStatus,
      completedBackgroundInfo
    )

    expect(result).toBeFalsy()
  })

  test(`Should approve a volunteer if all requirements are ${STATUS.APPROVED}`, () => {
    const photoIdStatus = STATUS.APPROVED
    const referenceStatus = [STATUS.APPROVED, STATUS.APPROVED]
    const completedBackgroundInfo = false
    const result = VolunteerService.getPendingVolunteerApprovalStatus(
      photoIdStatus,
      referenceStatus,
      completedBackgroundInfo
    )

    expect(result).toBeFalsy()
  })
})
*/
