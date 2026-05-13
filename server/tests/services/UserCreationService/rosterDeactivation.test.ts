import './mocks'
import { rosterPartnerStudents } from '../../../services/UserCreationService'
import {
  buildRosterStudent,
  HASHED_PASSWORD_RESOLVED,
  mockedAuthUtils,
  mockedMailService,
  mockedSignUpSourceRepo,
  mockedStudentPartnerOrgRepo,
  mockedUserRepo,
  ROSTER_SIGNUP_SOURCE_ID,
  setupExistingRosterStudent,
} from './fixtures'

describe('rosterPartnerStudents deactivation rows', () => {
  const USER_ID = 'existing-user-id'
  const SCHOOL_ID = 'school-id'
  const SPO_ID = 'spo-id'

  beforeAll(() => {
    mockedSignUpSourceRepo.getSignUpSourceByName.mockResolvedValue({
      id: ROSTER_SIGNUP_SOURCE_ID,
      name: 'Roster',
    })
    mockedAuthUtils.hashPassword.mockResolvedValue(HASHED_PASSWORD_RESOLVED)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deactivates USPOI, suppresses the password reset email, and reports the row in both updated and deactivated', async () => {
    const deactivatedOn = '2026-04-01T00:00:00.000Z'
    const rosterStudent = buildRosterStudent({ deactivatedOn })
    setupExistingRosterStudent(rosterStudent, {
      userId: USER_ID,
      spo: { partnerId: SPO_ID, schoolId: SCHOOL_ID },
    })

    const result = await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance.mock
        .lastCall
    ).toEqual(
      expect.arrayContaining([USER_ID, SPO_ID, new Date(deactivatedOn)])
    )
    expect(
      mockedMailService.sendRosterStudentSetPasswordEmail
    ).not.toHaveBeenCalled()
    expect(result.updated).toEqual([
      expect.objectContaining({ id: USER_ID, email: rosterStudent.email }),
    ])
    expect(result.deactivated).toEqual([
      { id: USER_ID, email: rosterStudent.email },
    ])
  })

  test('fails the row when deactivation is requested but the email has no existing account', async () => {
    const rosterStudent = buildRosterStudent({ deactivatedOn: '2026-04-01' })
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)

    const result = await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(result.failed).toEqual([
      {
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        reason: expect.stringContaining('no existing account'),
      },
    ])
    expect(result.updated).toEqual([])
    expect(result.deactivated).toEqual([])
  })

  test('fails the row when the school has no associated SPO but still applies the upsert', async () => {
    const rosterStudent = buildRosterStudent({ deactivatedOn: '2026-04-01' })
    setupExistingRosterStudent(rosterStudent, { userId: USER_ID })

    const result = await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(result.updated).toEqual([
      expect.objectContaining({ id: USER_ID, email: rosterStudent.email }),
    ])
    expect(result.failed).toEqual([
      {
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        reason: expect.stringContaining('no student partner org is associated'),
      },
    ])
    expect(result.deactivated).toEqual([])
    expect(
      mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance
    ).not.toHaveBeenCalled()
  })

  test('fails the row when the user is not a member of the SPO', async () => {
    const rosterStudent = buildRosterStudent({ deactivatedOn: '2026-04-01' })
    setupExistingRosterStudent(rosterStudent, {
      userId: USER_ID,
      spo: { partnerId: SPO_ID, schoolId: SCHOOL_ID },
    })
    mockedStudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance.mockResolvedValue(
      false
    )

    const result = await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(result.updated).toEqual([
      expect.objectContaining({ id: USER_ID, email: rosterStudent.email }),
    ])
    expect(result.failed).toEqual([
      {
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        reason: expect.stringContaining(
          'not a member of the student partner org'
        ),
      },
    ])
    expect(result.deactivated).toEqual([])
  })

  test('still applies the upsert when deactivatedOn is unparseable, and reports the row in both updated and failed', async () => {
    const rosterStudent = buildRosterStudent({
      deactivatedOn: 'not-a-real-date',
    })
    setupExistingRosterStudent(rosterStudent, { userId: USER_ID })

    const result = await rosterPartnerStudents([rosterStudent], SCHOOL_ID)

    expect(result.updated).toEqual([
      expect.objectContaining({ id: USER_ID, email: rosterStudent.email }),
    ])
    expect(result.failed).toEqual([
      {
        email: rosterStudent.email,
        firstName: rosterStudent.firstName,
        reason: expect.stringContaining('could not parse deactivatedOn'),
      },
    ])
  })
})
