import type { Job } from 'bull'
import { mocked } from 'jest-mock'
import { SUBJECTS, SUBJECT_TYPES } from '../../constants'
import { getDbUlid } from '../../models/pgUtils'
import logger from '../../logger'
import textVolunteers, {
  filterFavoritedVolunteers,
  filterPartnerVolunteers,
  filterSubjectEligibleVolunteers,
  selectVolunteersByPriority,
} from '../../worker/jobs/textVolunteers'
import * as AssociatedPartnerService from '../../services/AssociatedPartnerService'
import * as CacheService from '../../cache'
import * as FavoritingService from '../../services/FavoritingService'
import * as SessionService from '../../services/SessionService'
import * as TwilioService from '../../services/TwilioService'
import { AssociatedPartner } from '../../models/AssociatedPartner'
import { buildTextableVolunteer } from '../mocks/generate'

jest.mock('../../services/AssociatedPartnerService')
jest.mock('../../cache')
jest.mock('../../services/FavoritingService')
jest.mock('../../services/SessionService')
jest.mock('../../services/TwilioService')
jest.mock('../../logger')

const mockedAssociatedPartnerService = mocked(AssociatedPartnerService)
const mockedCacheService = mocked(CacheService)
const mockedFavoritingService = mocked(FavoritingService)
const mockedSessionService = mocked(SessionService)
const mockedTwilioService = mocked(TwilioService)
const mockedLogger = mocked(logger)

describe('TextVolunteers job', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedCacheService.getIfExists.mockResolvedValue(undefined)
    mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValue(
      undefined
    )
    mockedFavoritingService.getFavoritedVolunteerIdsFromList.mockResolvedValue(
      new Set()
    )
    mockedSessionService.getVolunteersInSessions.mockResolvedValue(new Set())
    mockedTwilioService.sendTextMessage.mockResolvedValue(undefined)
  })

  describe('filterSubjectEligibleVolunteers', () => {
    test('should include volunteers who have the subject unlocked', () => {
      const volunteer1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE, SUBJECTS.GEOMETRY],
      })
      const volunteer2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CHEMISTRY],
      })
      const volunteer3 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      const result = filterSubjectEligibleVolunteers(
        [volunteer1, volunteer2, volunteer3],
        SUBJECTS.ALGEBRA_ONE
      )

      expect(result).toHaveLength(2)
      expect(result).toContainEqual(
        expect.objectContaining({ id: volunteer1.id })
      )
      expect(result).toContainEqual(
        expect.objectContaining({ id: volunteer3.id })
      )
      expect(result).not.toContainEqual(
        expect.objectContaining({ id: volunteer2.id })
      )
    })

    test('should exclude volunteers who have muted the subject', () => {
      const volunteer1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        mutedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const volunteer2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        mutedSubjects: [],
      })

      const result = filterSubjectEligibleVolunteers(
        [volunteer1, volunteer2],
        SUBJECTS.ALGEBRA_ONE
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(volunteer2.id)
    })

    test('should exclude volunteers without the subject unlocked', () => {
      const volunteer1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CHEMISTRY, SUBJECTS.BIOLOGY],
      })
      const volunteer2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.GEOMETRY],
      })

      const result = filterSubjectEligibleVolunteers(
        [volunteer1, volunteer2],
        SUBJECTS.ALGEBRA_ONE
      )

      expect(result).toHaveLength(0)
    })

    test('should include high-level volunteers for high-level subjects', () => {
      const highLevelVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB, SUBJECTS.ALGEBRA_ONE],
      })
      const nonMatchingHighLevelVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.PHYSICS_ONE],
      })
      const regularVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      const result = filterSubjectEligibleVolunteers(
        [highLevelVolunteer, nonMatchingHighLevelVolunteer, regularVolunteer],
        SUBJECTS.CALCULUS_AB
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(highLevelVolunteer.id)
    })

    test('should exclude high-level volunteers from low-level subjects', () => {
      const highLevelVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB, SUBJECTS.ALGEBRA_ONE],
      })
      const regularVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      const result = filterSubjectEligibleVolunteers(
        [highLevelVolunteer, regularVolunteer],
        SUBJECTS.ALGEBRA_ONE
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(regularVolunteer.id)
    })
  })

  describe('filterFavoritedVolunteers', () => {
    test('should return only favorited volunteers', async () => {
      const studentId = getDbUlid()
      const favoritedVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const regularVolunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedFavoritingService.getFavoritedVolunteerIdsFromList.mockResolvedValueOnce(
        new Set([favoritedVolunteer.id])
      )

      const result = await filterFavoritedVolunteers(
        [favoritedVolunteer, regularVolunteer],
        studentId
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(favoritedVolunteer.id)
    })

    test('should return empty array when no volunteers favorited', async () => {
      const studentId = getDbUlid()
      const volunteer1 = buildTextableVolunteer()
      const volunteer2 = buildTextableVolunteer()

      mockedFavoritingService.getFavoritedVolunteerIdsFromList.mockResolvedValueOnce(
        new Set()
      )

      const result = await filterFavoritedVolunteers(
        [volunteer1, volunteer2],
        studentId
      )

      expect(result).toHaveLength(0)
    })

    test('should handle empty volunteer list', async () => {
      const studentId = getDbUlid()

      const result = await filterFavoritedVolunteers([], studentId)

      expect(result).toHaveLength(0)
      expect(
        mockedFavoritingService.getFavoritedVolunteerIdsFromList
      ).not.toHaveBeenCalled()
    })
  })

  describe('filterPartnerVolunteers', () => {
    test('should return volunteers from matching partner org with studentOrgDisplay', async () => {
      const partnerVolunteer1 = buildTextableVolunteer({
        volunteerPartnerOrgKey: 'example-partner',
      })
      const partnerVolunteer2 = buildTextableVolunteer({
        volunteerPartnerOrgKey: 'example-partner',
      })
      const otherVolunteer = buildTextableVolunteer({
        volunteerPartnerOrgKey: 'other-partner',
      })

      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example Partner School',
        } as AssociatedPartner
      )

      const result = await filterPartnerVolunteers(
        [partnerVolunteer1, partnerVolunteer2, otherVolunteer],
        'student-partner-org',
        'school-id'
      )

      expect(result).toHaveLength(2)
      expect(result).toContainEqual(
        expect.objectContaining({
          id: partnerVolunteer1.id,
          studentOrgDisplay: 'Example Partner School',
        })
      )
      expect(result).toContainEqual(
        expect.objectContaining({
          id: partnerVolunteer2.id,
          studentOrgDisplay: 'Example Partner School',
        })
      )
    })

    test('should return undefined when no associated partner exists', async () => {
      const volunteer1 = buildTextableVolunteer()
      const volunteer2 = buildTextableVolunteer()

      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        undefined
      )

      const result = await filterPartnerVolunteers(
        [volunteer1, volunteer2],
        'student-partner-org',
        'school-id'
      )

      expect(result).toBeUndefined()
    })

    test('should return empty array when no volunteers match partner org', async () => {
      const volunteer1 = buildTextableVolunteer({
        volunteerPartnerOrgKey: 'other-partner',
      })
      const volunteer2 = buildTextableVolunteer({
        volunteerPartnerOrgKey: undefined,
      })

      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example Partner School',
        } as AssociatedPartner
      )

      const result = await filterPartnerVolunteers(
        [volunteer1, volunteer2],
        'student-partner-org',
        'school-id'
      )

      expect(result).toHaveLength(0)
    })

    test('should handle volunteers without partner org key', async () => {
      const partnerVolunteer = buildTextableVolunteer({
        volunteerPartnerOrgKey: 'example-partner',
      })
      const volunteerWithoutPartner = buildTextableVolunteer({
        volunteerPartnerOrgKey: undefined,
      })

      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example Partner School',
        } as AssociatedPartner
      )

      const result = await filterPartnerVolunteers(
        [partnerVolunteer, volunteerWithoutPartner],
        'student-partner-org',
        'school-id'
      )

      expect(result).toHaveLength(1)
      expect(result?.[0].id).toBe(partnerVolunteer.id)
      expect(result?.[0].studentOrgDisplay).toBe('Example Partner School')
    })
  })

  describe('selectVolunteersByPriority', () => {
    test('should select volunteers only from favorited volunteers group when sufficient', async () => {
      const favoritedVol1 = buildTextableVolunteer()
      const favoritedVol2 = buildTextableVolunteer()
      const favoritedVol3 = buildTextableVolunteer()
      const partnerVol = buildTextableVolunteer()
      const regularVol = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [favoritedVol1, favoritedVol2, favoritedVol3],
        [partnerVol],
        [regularVol]
      )

      expect(result).toHaveLength(2)
      expect(
        result.every(
          (v) =>
            v.id === favoritedVol1.id ||
            v.id === favoritedVol2.id ||
            v.id === favoritedVol3.id
        )
      ).toBe(true)
    })

    test('should fall back to partner volunteers group when favorited group is insufficient', async () => {
      const favoritedVol = buildTextableVolunteer()
      const partnerVol1 = buildTextableVolunteer()
      const partnerVol2 = buildTextableVolunteer()
      const regularVol = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [favoritedVol],
        [partnerVol1, partnerVol2],
        [regularVol]
      )

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(favoritedVol.id)
      expect(
        result[1].id === partnerVol1.id || result[1].id === partnerVol2.id
      ).toBe(true)
    })

    test('should fall back to all volunteers when higher priority groups are insufficient', async () => {
      const favoritedVol = buildTextableVolunteer()
      const regularVol1 = buildTextableVolunteer()
      const regularVol2 = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [favoritedVol],
        [],
        [regularVol1, regularVol2]
      )

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(favoritedVol.id)
      expect(
        result[1].id === regularVol1.id || result[1].id === regularVol2.id
      ).toBe(true)
    })

    test('should respect subject-specific text limits', async () => {
      const vol1 = buildTextableVolunteer()
      const vol2 = buildTextableVolunteer()
      const vol3 = buildTextableVolunteer()
      const vol4 = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.CALCULUS_AB,
        [],
        [],
        [vol1, vol2, vol3, vol4]
      )

      expect(result).toHaveLength(3)
    })

    test('should default to 2 texts for subjects without specific limits', async () => {
      const vol1 = buildTextableVolunteer()
      const vol2 = buildTextableVolunteer()
      const vol3 = buildTextableVolunteer()
      const vol4 = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.GEOMETRY,
        [],
        [],
        [vol1, vol2, vol3, vol4]
      )

      expect(result).toHaveLength(2)
    })

    test('should exclude volunteers currently in sessions', async () => {
      const busyVol = buildTextableVolunteer()
      const availableVol1 = buildTextableVolunteer()

      mockedSessionService.getVolunteersInSessions.mockResolvedValueOnce(
        new Set([busyVol.id])
      )

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [],
        [],
        [busyVol, availableVol1]
      )

      expect(result).toHaveLength(1)
      expect(result).not.toContainEqual(
        expect.objectContaining({ id: busyVol.id })
      )
      expect(result).toContainEqual(
        expect.objectContaining({ id: availableVol1.id })
      )
    })

    test('should return fewer than limit when not enough volunteers available', async () => {
      const vol1 = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [],
        [],
        [vol1]
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(vol1.id)
    })

    test('should return empty array when no volunteers available', async () => {
      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [],
        [],
        []
      )

      expect(result).toHaveLength(0)
    })

    test('should maintain priority order across groups', async () => {
      const favoritedVol = buildTextableVolunteer()
      const partnerVol = buildTextableVolunteer()
      const regularVol1 = buildTextableVolunteer()
      const regularVol2 = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.CALCULUS_AB,
        [favoritedVol],
        [partnerVol],
        [regularVol1, regularVol2]
      )

      expect(result).toHaveLength(3)
      expect(result[0].id).toBe(favoritedVol.id)
      expect(result[1].id).toBe(partnerVol.id)
      expect(
        result[2].id === regularVol1.id || result[2].id === regularVol2.id
      ).toBe(true)
    })

    test('should deduplicate volunteers appearing in multiple priority groups', async () => {
      const partnerVol = buildTextableVolunteer()

      const result = await selectVolunteersByPriority(
        SUBJECTS.ALGEBRA_ONE,
        [],
        [partnerVol],
        [partnerVol]
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(partnerVol.id)
    })
  })

  describe('textVolunteers', () => {
    test('should prioritize favorited volunteers over partner and regular volunteers', async () => {
      const studentId = getDbUlid()
      const favoritedVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const partnerVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        volunteerPartnerOrgKey: 'example-partner',
      })
      const regularVol1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const regularVol2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([favoritedVol, partnerVol, regularVol1, regularVol2])
      )
      mockedFavoritingService.getFavoritedVolunteerIdsFromList.mockResolvedValueOnce(
        new Set([favoritedVol.id])
      )
      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example School',
        } as AssociatedPartner
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId,
          studentPartnerOrg: 'student-partner-org',
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(2)
      expect(mockedTwilioService.sendTextMessage).toHaveBeenNthCalledWith(
        1,
        favoritedVol.phone,
        expect.anything()
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenNthCalledWith(
        2,
        partnerVol.phone,
        expect.anything()
      )
    })

    test('should filter out volunteers who do not have subject unlocked', async () => {
      const algebraVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const chemistryVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CHEMISTRY],
      })
      const geometryVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.GEOMETRY],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([algebraVol, chemistryVol, geometryVol])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }

      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(1)
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        algebraVol.phone,
        expect.anything()
      )
    })

    test('should exclude high-level volunteers from low-level subjects', async () => {
      const highLevelVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB, SUBJECTS.ALGEBRA_ONE],
      })
      const regularVol1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const regularVol2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([highLevelVol, regularVol1, regularVol2])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }

      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(2)
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalledWith(
        highLevelVol.phone,
        expect.anything()
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        regularVol1.phone,
        expect.anything()
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        regularVol2.phone,
        expect.anything()
      )
    })

    test('should exclude volunteers who have muted the subject', async () => {
      const mutedVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        mutedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const availableVol1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const availableVol2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([mutedVol, availableVol1, availableVol2])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }

      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(2)
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalledWith(
        mutedVol.phone,
        expect.anything()
      )
    })

    test('should exclude volunteers currently in sessions', async () => {
      const busyVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const availableVol1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const availableVol2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([busyVol, availableVol1, availableVol2])
      )
      mockedSessionService.getVolunteersInSessions.mockResolvedValueOnce(
        new Set([busyVol.id])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }

      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(2)
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalledWith(
        busyVol.phone,
        expect.anything()
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        availableVol1.phone,
        expect.anything()
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        availableVol2.phone,
        expect.anything()
      )
    })

    test('should respect subject-specific text limits (Calculus AB = 3)', async () => {
      const vol1 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB],
      })
      const vol2 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB],
      })
      const vol3 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB],
      })
      const vol4 = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([vol1, vol2, vol3, vol4])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.CALCULUS_AB,
          subjectDisplayName: 'Calculus AB',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(3)
    })

    test('should include student org display in message when partner exists', async () => {
      const volunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        volunteerPartnerOrgKey: 'example-partner',
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([volunteer])
      )
      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example School',
        } as AssociatedPartner
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
          studentPartnerOrg: 'student-partner-org',
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(1)
      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        volunteer.phone,
        expect.stringContaining('Example School student')
      )
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalledWith(
        volunteer.phone,
        expect.stringContaining('a student needs help')
      )
    })

    test('should use generic "a student" when no partner org', async () => {
      const volunteer = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([volunteer])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledWith(
        volunteer.phone,
        expect.stringContaining('a student needs help')
      )
    })

    test('should log warning when no eligible volunteers found', async () => {
      const sessionId = getDbUlid()
      const chemistryVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CHEMISTRY],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([chemistryVol])
      )

      const job = {
        data: {
          sessionId,
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId: getDbUlid(),
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenCalled()
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        { sessionId, subject: SUBJECTS.ALGEBRA_ONE },
        'No volunteers found to text for session.'
      )
    })

    test('should handle complex priority scenario with all filters applied', async () => {
      const studentId = getDbUlid()
      const favoritedVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const partnerVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        volunteerPartnerOrgKey: 'example-partner',
      })
      const highLevelVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CALCULUS_AB, SUBJECTS.ALGEBRA_ONE],
      })
      const mutedVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
        mutedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const busyVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.ALGEBRA_ONE],
      })
      const chemistryVol = buildTextableVolunteer({
        unlockedSubjects: [SUBJECTS.CHEMISTRY],
      })

      mockedCacheService.getIfExists.mockResolvedValueOnce(
        JSON.stringify([
          highLevelVol,
          mutedVol,
          busyVol,
          chemistryVol,
          partnerVol,
          favoritedVol,
        ])
      )
      mockedFavoritingService.getFavoritedVolunteerIdsFromList.mockResolvedValueOnce(
        new Set([favoritedVol.id, busyVol.id])
      )
      mockedAssociatedPartnerService.getAssociatedPartner.mockResolvedValueOnce(
        {
          volunteerPartnerOrg: 'example-partner',
          studentOrgDisplay: 'Example School',
        } as AssociatedPartner
      )
      mockedSessionService.getVolunteersInSessions.mockResolvedValueOnce(
        new Set([busyVol.id])
      )

      const job = {
        data: {
          sessionId: getDbUlid(),
          subject: SUBJECTS.ALGEBRA_ONE,
          subjectDisplayName: 'Algebra 1',
          topic: SUBJECT_TYPES.MATH,
          studentId,
          studentPartnerOrg: 'student-partner-org',
        },
      }
      await textVolunteers(job as Job)

      expect(mockedTwilioService.sendTextMessage).toHaveBeenCalledTimes(2)
      expect(mockedTwilioService.sendTextMessage).toHaveBeenNthCalledWith(
        1,
        favoritedVol.phone,
        expect.stringContaining('a student needs help')
      )
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenNthCalledWith(
        1,
        favoritedVol.phone,
        expect.stringContaining('Example School student')
      )
      expect(mockedTwilioService.sendTextMessage).toHaveBeenNthCalledWith(
        2,
        partnerVol.phone,
        expect.stringContaining('Example School student')
      )
      expect(mockedTwilioService.sendTextMessage).not.toHaveBeenNthCalledWith(
        2,
        partnerVol.phone,
        expect.stringContaining('a student needs help')
      )
    })
  })
})
