import { mocked } from 'jest-mock'
import * as StudentRepo from '../../models/Student/queries'
import * as StudentPartnerOrgRepo from '../../models/StudentPartnerOrg/queries'
import { bulkDeactivatePartnerStudents } from '../../services/PartnerStudentService'

jest.mock('../../models/Student/queries')
jest.mock('../../models/StudentPartnerOrg/queries')

const mockedStudentRepo = mocked(StudentRepo)
const mockedStudentPartnerOrgRepo = mocked(StudentPartnerOrgRepo)

describe('bulkDeactivatePartnerStudents', () => {
  const PARTNER_KEY = 'test-partner'
  const PARTNER_ORG_ID = 'partner-org-id-123'
  const STUDENT_ID = 'student-id-456'
  const STUDENT_EMAIL = 'student@example.com'

  beforeEach(() => {
    jest.clearAllMocks()
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue({
      partnerId: PARTNER_ORG_ID,
      partnerKey: PARTNER_KEY,
      partnerName: 'Test Partner',
    })
  })

  test('deactivates active USPO for matching student', async () => {
    mockedStudentRepo.getStudentByEmail.mockResolvedValue({ id: STUDENT_ID })
    mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
      { id: PARTNER_ORG_ID, name: 'Partner Org' },
    ])

    const result = await bulkDeactivatePartnerStudents(
      [{ email: STUDENT_EMAIL }],
      PARTNER_KEY
    )

    expect(result.deactivated).toEqual([{ email: STUDENT_EMAIL }])
    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
    ).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      STUDENT_ID,
      PARTNER_ORG_ID,
      undefined
    )
  })

  test('skips student not found by email', async () => {
    mockedStudentRepo.getStudentByEmail.mockResolvedValue(undefined)

    const result = await bulkDeactivatePartnerStudents(
      [{ email: 'unknown@example.com' }],
      PARTNER_KEY
    )

    expect(result.skipped).toEqual([
      { email: 'unknown@example.com', reason: 'user not found' },
    ])
    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
    ).not.toHaveBeenCalled()
  })

  test('skips student with no active USPO at this partner', async () => {
    mockedStudentRepo.getStudentByEmail.mockResolvedValue({ id: STUDENT_ID })
    mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
      { id: 'different-partner-org-id', name: 'Different Org' },
    ])

    const result = await bulkDeactivatePartnerStudents(
      [{ email: STUDENT_EMAIL }],
      PARTNER_KEY
    )

    expect(result.skipped).toEqual([
      {
        email: STUDENT_EMAIL,
        reason: 'no active partnership at this partner',
      },
    ])
  })

  test('passes custom deactivatedOn date to repo function', async () => {
    mockedStudentRepo.getStudentByEmail.mockResolvedValue({ id: STUDENT_ID })
    mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
      { id: PARTNER_ORG_ID, name: 'Partner Org' },
    ])

    const result = await bulkDeactivatePartnerStudents(
      [{ email: STUDENT_EMAIL, deactivatedOn: '2026-06-15' }],
      PARTNER_KEY
    )

    expect(result.deactivated).toEqual([{ email: STUDENT_EMAIL }])
    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
    ).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      STUDENT_ID,
      PARTNER_ORG_ID,
      new Date('2026-06-15')
    )
  })

  test('skips row with invalid deactivatedOn date', async () => {
    mockedStudentRepo.getStudentByEmail.mockResolvedValue({ id: STUDENT_ID })
    mockedStudentRepo.getActivePartnersForStudent.mockResolvedValue([
      { id: PARTNER_ORG_ID, name: 'Partner Org' },
    ])

    const result = await bulkDeactivatePartnerStudents(
      [{ email: STUDENT_EMAIL, deactivatedOn: 'not-a-date' }],
      PARTNER_KEY
    )

    expect(result.skipped).toEqual([
      { email: STUDENT_EMAIL, reason: 'invalid deactivatedOn date' },
    ])
    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
    ).not.toHaveBeenCalled()
  })

  test('throws when no partner org found for key', async () => {
    mockedStudentPartnerOrgRepo.getStudentPartnerOrgByKey.mockResolvedValue(
      undefined
    )

    await expect(
      bulkDeactivatePartnerStudents(
        [{ email: STUDENT_EMAIL }],
        'nonexistent-key'
      )
    ).rejects.toThrow('No partner organization found for key')
  })
})
