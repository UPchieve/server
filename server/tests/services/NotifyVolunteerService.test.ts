import * as SessionRepo from '../../models/Session/queries'
import * as StudentRepo from '../../models/Student/queries'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import { mocked } from 'jest-mock'
import * as NotifyVolunteerService from '../../services/NotifyVolunteerService'
import { buildStudent, buildSession, buildVolunteer } from '../mocks/generate'

import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/Session/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../models/Volunteer/queries')
jest.mock('../../utils/get-times')
jest.mock('../../services/AssociatedPartnerService')

const mockedSessionRepo = mocked(SessionRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedVolunteerRepo = mocked(VolunteerRepo)

const buildStudentAndSessionForMutedSubjects = async () => {
  const studentId = getDbUlid()
  const student = buildStudent({ id: studentId })
  const session = buildSession({ studentId })

  mockedStudentRepo.getStudentContactInfoById.mockResolvedValue(student)
  mockedSessionRepo.getActiveSessionsWithVolunteers.mockResolvedValueOnce([])
  mockedVolunteerRepo.getVolunteersNotifiedBySessionId.mockResolvedValueOnce([])
  return session
}

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('Muted subjects tests', () => {
  test('Notifies volunteer if subject is not muted', async () => {
    const volunteer = buildVolunteer()
    const session = await buildStudentAndSessionForMutedSubjects()
    mockedVolunteerRepo.getNextVolunteerToNotify.mockResolvedValueOnce(
      volunteer
    )
    const notifiedVolunteerId =
      await NotifyVolunteerService.notifyVolunteer(session)

    expect(notifiedVolunteerId!).toEqual(volunteer.id)
  })

  test('Does not notify volunteer for muted subject', async () => {
    const volunteer = buildVolunteer({ mutedSubjectAlerts: ['algebraOne'] })
    const session = await buildStudentAndSessionForMutedSubjects()
    mockedVolunteerRepo.getNextVolunteerToNotify.mockResolvedValueOnce(
      volunteer
    )
    mockedVolunteerRepo.checkIfVolunteerMutedSubject.mockResolvedValue(true)
    const notifiedVolunteerId =
      await NotifyVolunteerService.notifyVolunteer(session)

    expect(notifiedVolunteerId!).toBe(undefined)
  })
})
