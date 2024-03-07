import * as TwilioService from '../../services/TwilioService'
import faker from 'faker'
import { mockedCreateMessageResponse } from '../../__mocks__/twilio'
import twilio from 'twilio'
import * as SessionRepo from '../../models/Session'
import * as StudentRepo from '../../models/Student'
import * as VolunteerRepo from '../../models/Volunteer'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { mocked } from 'jest-mock'
import { StudentContactInfo } from '../../models/Student'
import { VolunteerContactInfo } from '../../models/Volunteer'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import { buildSession } from '../mocks/generate'
import {
  buildNotificationContent,
  buildTargetStudentContent,
} from '../../services/TwilioService'
import { AssociatedPartner } from '../../models/AssociatedPartner'

jest.mock('../../models/Session')
jest.mock('../../models/Student')
jest.mock('../../models/Volunteer')
jest.mock('../../services/FeatureFlagService')
const mockedSessionRepo = mocked(SessionRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockedFeatureFlagService = mocked(FeatureFlagService)

jest.mock('twilio')
describe('TwilioService', () => {
  let volunteerContactInfo: VolunteerContactInfo
  let studentContactInfo: StudentContactInfo
  let session: any

  beforeEach(() => {
    jest.clearAllMocks()
    volunteerContactInfo = {
      id: getDbUlid(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber('+##########'),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    }
    studentContactInfo = {
      id: getDbUlid(),
      firstName: faker.name.firstName(),
      email: faker.internet.email(),
    }
    session = buildSession({ studentId: studentContactInfo.id })
  })

  describe('sendTextMessage', () => {
    const TEST_PHONE_NUMBER = faker.phone.phoneNumber('+###########')
    const TEST_MESSAGE_TEXT = 'This is a test message'

    it('On success, will return the message SID', async () => {
      expect(
        await TwilioService.sendTextMessage(
          TEST_PHONE_NUMBER,
          TEST_MESSAGE_TEXT
        )
      ).toEqual(mockedCreateMessageResponse.sid)
    })

    it('Will throw an error if there is no message SID', async () => {
      ;(twilio().messages.create as jest.Mock).mockResolvedValueOnce({
        status: 'failed',
      })
      await expect(
        TwilioService.sendTextMessage(TEST_PHONE_NUMBER, TEST_MESSAGE_TEXT)
      ).rejects.toThrowError(
        `Failed to send text message ${TEST_MESSAGE_TEXT} to ${TEST_PHONE_NUMBER}`
      )
    })
  })

  describe('notifyVolunteer', () => {
    beforeEach(() => {
      mockedStudentRepo.getStudentContactInfoById.mockResolvedValue(
        studentContactInfo
      )
      mockedStudentRepo.getFavoriteVolunteersByStudentId.mockResolvedValue([])
      mockedSessionRepo.getActiveSessionsWithVolunteers.mockResolvedValue([])
      mockedVolunteerRepo.getVolunteersNotifiedBySessionId.mockResolvedValue([])
      mockedVolunteerRepo.getNextVolunteerToNotify.mockResolvedValue(
        volunteerContactInfo
      )
      mockedFeatureFlagService.getMutedSubjectAlertsFlag.mockResolvedValue(
        false
      )
    })

    it('Will record the notification in the DB with correct properties', async () => {
      const result = await TwilioService.notifyVolunteer(session)
      expect(result).toEqual(volunteerContactInfo.id)
      expect(mockedSessionRepo.addSessionNotification).toHaveBeenCalledWith(
        session.id,
        expect.objectContaining({
          wasSuccessful: true,
          volunteer: volunteerContactInfo.id,
          method: 'sms',
          messageId: mockedCreateMessageResponse.sid,
        })
      )
    })

    it('Will not record a notification or send a message if no suitable volunteer was found', async () => {
      mockedVolunteerRepo.getNextVolunteerToNotify.mockResolvedValue(undefined)
      const result = await TwilioService.notifyVolunteer(session)
      expect(result).toBeUndefined()
      expect(mockedSessionRepo.addSessionNotification).not.toHaveBeenCalled()
      expect(twilio().messages.create).not.toHaveBeenCalled()
    })
  })

  describe('sendFollowupText', () => {
    it('Will record the notification in the DB with correct properties', async () => {
      const sessionId = getDbUlid()
      const volunteerId = getDbUlid()
      const testPhone = faker.phone.phoneNumber('+##########')
      await TwilioService.sendFollowupText(sessionId, volunteerId, testPhone)
      expect(mockedSessionRepo.addSessionNotification).toHaveBeenCalledWith(
        sessionId,
        {
          wasSuccessful: true,
          messageId: mockedCreateMessageResponse.sid,
          volunteer: volunteerId,
          type: 'followup',
          method: 'sms',
          priorityGroup: 'follow-up',
        }
      )

      // Message send fails => Record notification with undefined messageId and wasSuccessful = false
      ;(twilio().messages.create as jest.Mock).mockResolvedValue({
        status: 'failed',
      })
      await TwilioService.sendFollowupText(sessionId, volunteerId, testPhone)
      expect(mockedSessionRepo.addSessionNotification).toHaveBeenCalledWith(
        sessionId,
        {
          wasSuccessful: false,
          messageId: undefined,
          volunteer: volunteerId,
          type: 'followup',
          method: 'sms',
          priorityGroup: 'follow-up',
        }
      )
    })
  })

  describe('buildTargetStudentContent', () => {
    let associatedPartner: AssociatedPartner
    let partnerOrg

    beforeEach(() => {
      associatedPartner = {
        key: 'ap',
        volunteerPartnerOrg: 'VPO',
        volunteerOrgDisplay: 'VPO',
        studentOrgDisplay: 'Test',
      }
    })
    it(`Returns "a student" when there is no associatedPartner`, () => {
      expect(
        buildTargetStudentContent(volunteerContactInfo, undefined)
      ).toEqual('a student')
    })

    it(`Returns "a student" when there is no associatedPartner studentOrgDisplay`, () => {
      const testPartner: AssociatedPartner = { ...associatedPartner }
      delete testPartner.studentOrgDisplay
      expect(
        buildTargetStudentContent(volunteerContactInfo, associatedPartner)
      ).toEqual('a student')
    })

    it.each([
      ['an iStartWithVowel student', 'iStartWithVowel'],
      ['a butIDontStartWithVowel student', 'butIDontStartWithVowel'],
    ])(
      `Returns "%s" when the associatedPartner.studentOrgDisplay is %s`,
      async (expected, displayName) => {
        volunteerContactInfo.volunteerPartnerOrg =
          associatedPartner.volunteerPartnerOrg
        const partner = {
          ...associatedPartner,
          studentOrgDisplay: displayName,
        }
        expect(volunteerContactInfo.volunteerPartnerOrg).toEqual(
          partner.volunteerPartnerOrg
        )
        expect(
          buildTargetStudentContent(volunteerContactInfo, partner)
        ).toEqual(expected)
      }
    )

    it(`Returns "a student" if the associated partner VPO does not match the volunteer VPO`, async () => {
      volunteerContactInfo.volunteerPartnerOrg = 'blah'
      expect(
        buildTargetStudentContent(volunteerContactInfo, associatedPartner)
      ).toEqual('a student')
    })
  })

  describe('buildNotificationContent', () => {
    it('Returns the expected notification content', async () => {
      const associatedPartner: AssociatedPartner = {
        key: 'ap',
        volunteerPartnerOrg: 'vpo123',
        volunteerOrgDisplay: 'vpo123',
      }
      volunteerContactInfo.firstName = 'Jamie'
      session.subjectDisplayName = 'Prealgebra'
      const actual = buildNotificationContent(
        session,
        volunteerContactInfo,
        associatedPartner
      )
      expect(
        actual.startsWith(
          `Hi Jamie, a student needs help in Prealgebra on UPchieve!`
        )
      ).toBeTruthy()
    })
  })

  test.todo('getAssociatedPartner tests')
})
