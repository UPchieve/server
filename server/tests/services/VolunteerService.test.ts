import * as VolunteerService from '../../services/VolunteerService'
import * as VolunteerRepo from '../../models/Volunteer'
import QueueService from '../../services/QueueService'
import * as AnalyticsService from '../../services/AnalyticsService'
import { createAccountAction } from '../../models/UserAction'
import { TransactionClient } from '../../db'
import { ACCOUNT_USER_ACTIONS, EVENTS } from '../../constants'
import { mocked } from 'jest-mock'

jest.mock('../../models/Volunteer')
jest.mock('../../services/QueueService', () => ({
  add: jest.fn(),
}))
jest.mock('../../services/AnalyticsService', () => ({
  captureEvent: jest.fn(),
}))
jest.mock('../../models/UserAction', () => ({
  createAccountAction: jest.fn(),
}))

const mockedVolunteerRepo = mocked(VolunteerRepo)

describe('onboardVolunteer', () => {
  const mockVolunteer = {
    id: 'volunteer123',
    firstName: 'Volunteer',
    email: 'volunteer@email.com',
    onboarded: false,
    approved: false,
    subjects: ['algebraOne'],
    hasCompletedUpchieve101: true,
    availabilityLastModifiedAt: new Date(),
  }
  const mockIp = 'mock-ip'
  const tc = {} as TransactionClient

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call all functions in the if block when conditions are met', async () => {
    mockedVolunteerRepo.getVolunteerForOnboardingById.mockResolvedValue(
      mockVolunteer
    )
    await VolunteerService.onboardVolunteer(mockVolunteer.id, mockIp, false, tc)

    expect(VolunteerRepo.updateVolunteerOnboarded).toHaveBeenCalledWith(
      mockVolunteer.id,
      tc
    )
    expect(QueueService.add).toHaveBeenCalledTimes(1)
    expect(createAccountAction).toHaveBeenCalledWith(
      {
        action: expect.any(String),
        userId: mockVolunteer.id,
        ipAddress: mockIp,
      },
      tc
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      mockVolunteer.id,
      EVENTS.ACCOUNT_ONBOARDED,
      {
        event: EVENTS.ACCOUNT_ONBOARDED,
      }
    )
  })

  test.each([
    ['missing subjects', { subjects: [] }],
    ['incomplete Upchieve101', { hasCompletedUpchieve101: false }],
    ['no availability', { availabilityLastModifiedAt: undefined }],
  ])(
    'should not call functions in the if block if volunteer is %s',
    async (_, override) => {
      const modifiedVolunteer = { ...mockVolunteer, ...override }
      mockedVolunteerRepo.getVolunteerForOnboardingById.mockResolvedValue(
        modifiedVolunteer
      )
      await VolunteerService.onboardVolunteer(
        modifiedVolunteer.id,
        mockIp,
        false,
        tc
      )

      expect(VolunteerRepo.updateVolunteerOnboarded).not.toHaveBeenCalled()
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(createAccountAction).not.toHaveBeenCalled()
      expect(AnalyticsService.captureEvent).not.toHaveBeenCalled()
    }
  )

  test('should not call partner-specific functions if volunteerPartnerOrg is undefined', async () => {
    await VolunteerService.onboardVolunteer(mockVolunteer.id, mockIp, false, tc)

    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })

  test('It does NOT require the volunteer to have set availability if skipAvailabilityOnboardingRequirement = true', async () => {
    const testVolunteerWithNoAvailability = {
      ...mockVolunteer,
      availabilityLastModifiedAt: undefined,
    }
    await VolunteerService.onboardVolunteer(
      testVolunteerWithNoAvailability.id,
      mockIp,
      true,
      tc
    )
    expect(VolunteerRepo.updateVolunteerOnboarded).toHaveBeenCalled()
    expect(createAccountAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: ACCOUNT_USER_ACTIONS.ONBOARDED,
        ipAddress: mockIp,
        userId: testVolunteerWithNoAvailability.id,
      }),
      expect.anything()
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      expect.anything(),
      EVENTS.ACCOUNT_ONBOARDED,
      expect.anything()
    )
  })

  test('It DOES require the volunteer to have set availability if skipAvailabilityOnboardingRequirement = false', async () => {
    const testVolunteerWithNoAvailability = {
      ...mockVolunteer,
      availabilityLastModifiedAt: undefined,
    }
    await VolunteerService.onboardVolunteer(
      testVolunteerWithNoAvailability.id,
      mockIp,
      false,
      tc
    )
    expect(VolunteerRepo.updateVolunteerOnboarded).not.toHaveBeenCalled()
    expect(createAccountAction).not.toHaveBeenCalled()
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      expect.anything(),
      EVENTS.ACCOUNT_ONBOARDED,
      expect.anything()
    )
  })
})
