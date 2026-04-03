import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as MailService from '../../services/MailService'
import * as NTHSService from '../../services/NTHSGroupsService'
import * as db from '../../db'
import { getDbUlid } from '../../models/pgUtils'
import { beforeEach } from '@jest/globals'

jest.mock('../../db')
jest.mock('../../models/NTHSGroups')
jest.mock('../../services/MailService')

const mockedMailService = jest.mocked(MailService)
const mockedNTHSRepo = jest.mocked(NTHSGroupsRepo)

beforeEach(() => {
  jest.resetAllMocks()

  jest.mocked(db.runInTransaction).mockImplementation((callback) => {
    return callback()
  })
})
describe('makeChaptersSchoolOfficial', () => {
  const baseContact1 = {
    nthsGroupId: 'group-id-1',
    userId: getDbUlid(),
    chapterName: "Bob's Burgers",
  }
  const chapter1AdminContacts = [
    { ...baseContact1, firstName: 'Malzie', email: 'malzie@test.com' },
    { ...baseContact1, firstName: 'Louise', email: 'louise@test.com' },
  ]
  const chapter1AdvisorContacts = [
    { ...baseContact1, firstName: 'Bob Belcher', email: 'bob@burgers.com' },
    {
      ...baseContact1,
      firstName: 'Linda Belcher',
      email: 'linda@burgers.com',
    },
  ]

  const baseContact2 = {
    nthsGroupId: 'group-id-2',
    userId: getDbUlid(),
    chapterName: 'Those Who Can, Dle Candles',
  }
  const chapter2AdminContacts = [
    { ...baseContact2, firstName: 'Mort', email: 'mort@burgers.com' },
  ]
  const chapter2AdvisorContacts = [
    { ...baseContact2, firstName: 'Teddy', email: 'teddy@burgers.com' },
  ]

  it('Sends emails to chapter admins and advisor', async () => {
    // First chapter
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
      chapter1AdminContacts
    )
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter1AdvisorContacts
    )

    // Second chapter
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
      chapter2AdminContacts
    )
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter2AdvisorContacts
    )

    await NTHSService.makeChaptersSchoolOfficial([
      baseContact1.nthsGroupId,
      baseContact2.nthsGroupId,
    ])
    expect(
      mockedNTHSRepo.updateSchoolAffiliationStatus
    ).toHaveBeenNthCalledWith(
      1,
      'AFFILIATED',
      baseContact1.nthsGroupId,
      undefined
    )
    expect(
      mockedNTHSRepo.updateSchoolAffiliationStatus
    ).toHaveBeenNthCalledWith(
      2,
      'AFFILIATED',
      baseContact2.nthsGroupId,
      undefined
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      1,
      [...chapter1AdminContacts, ...chapter1AdvisorContacts],
      baseContact1.chapterName
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      2,
      [...chapter2AdminContacts, ...chapter2AdvisorContacts],
      baseContact2.chapterName
    )
  })

  it.each([undefined, []])(
    'Throws an error if the chapter is missing presidents or advisors',
    async (advisorsResult) => {
      mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
        chapter1AdminContacts
      )
      mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(advisorsResult)
      await expect(async () =>
        NTHSService.makeChaptersSchoolOfficial([baseContact1.nthsGroupId])
      ).rejects.toThrow(
        `Could not mark NTHS chapter ${baseContact1.nthsGroupId} as official: Missing chapter presidents or advisors`
      )
    }
  )
})
