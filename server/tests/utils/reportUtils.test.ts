// @ts-nocheck
import moment from 'moment'
import { generateCustomPartnerReport } from '../../utils/reportUtils'
import * as UserActionService from '../../services/UserActionService'
import SessionService from '../../services/SessionService'
import * as AvailabilityService from '../../services/AvailabilityService'

describe('Generate telecom report', () => {
  test('Test hour sum algorithm', async () => {
    const rootTime = moment('2021-04-20', 'YYYY-MM-DD').tz('America/New_York')
    const certifications = {
      math: {
        passed: true
      }
    }
    const volunteers = [
      {
        _id: '1234567890ab',
        firstname: 'Test',
        lastname: 'User',
        email: 'email@email.com',
        certifications: certifications
      }
    ]
    const session1Time = moment(rootTime)
      .subtract(1, 'week')
      .hour(12)
      .minute(44)
    const session2Time = moment(rootTime)
      .subtract(1, 'week')
      .hour(14)
      .minute(1)
    const session3Time = moment(rootTime)
      .subtract(1, 'week')
      .hour(17)
      .minute(20)
    const session4Time = moment(rootTime)
      .subtract(1, 'week')
      .hour(21)
      .minute(0)
    const sessions = [
      {
        volunteerJoinedAt: session1Time,
        endedAt: moment(session1Time).add(43, 'minutes'), // contribute 30 min
        name: 'session 1'
      },
      {
        volunteerJoinedAt: session2Time,
        endedAt: moment(session2Time).add(12, 'minutes'), // contribute 0 min
        name: 'session 2'
      },
      {
        volunteerJoinedAt: session3Time,
        endedAt: moment(session3Time).add(88, 'minutes'), // contribute 90 min
        name: 'session 3'
      },
      {
        volunteerJoinedAt: session4Time,
        endedAt: moment(session4Time).add(60, 'minutes'), // contribute 60 min
        name: 'session 4'
      }
    ]
    const availabilityDateRange = [
      {
        date: moment(session1Time).toDate(),
        availability: {
          '12a': false,
          '1a': false,
          '2a': false,
          '3a': false,
          '4a': false,
          '5a': false,
          '6a': false,
          '7a': false,
          '8a': false,
          '9a': false,
          '10a': false,
          '11a': false,
          '12p': false,
          '1p': true, // contribute 60 min
          '2p': true, // contribute 60 min
          '3p': true, // contribute 60 min
          '4p': false,
          '5p': false,
          '6p': false,
          '7p': false,
          '8p': false,
          '9p': false,
          '10p': false,
          '11p': false
        }
      }
    ]
    const actions = [
      {
        // contribute 60 min
        createdAt: moment(rootTime)
          .subtract(1, 'week')
          .hour(10)
          .toDate()
      }
    ]

    jest
      .spyOn(UserActionService, 'getActionsWithPipeline')
      .mockImplementationOnce(() => {
        return actions
      })
    SessionService.getSessionsWithPipeline = jest.fn(() => {
      return sessions
    })
    jest
      .spyOn(AvailabilityService, 'getAvailabilityHistoryWithPipeline')
      .mockImplementationOnce(() => {
        return availabilityDateRange
      })

    const result = await generateCustomPartnerReport(volunteers, [])
    expect(result[0].hours).toBe(7)
  })
})
