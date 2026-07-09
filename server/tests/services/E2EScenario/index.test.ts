import { mocked } from 'jest-mock'
import { buildScenario } from '../../../services/E2EScenario'
import * as UserCreationService from '../../../services/UserCreationService'

jest.mock('../../../services/UserCreationService')

const mockedRegisterStudent = mocked(UserCreationService.registerStudent)

function mockRegisteredStudent(id: string) {
  mockedRegisterStudent.mockResolvedValueOnce({
    id,
    isAdmin: false,
    userType: 'student',
  } as any)
}

describe('buildScenario', () => {
  beforeEach(() => jest.clearAllMocks())

  test('returns an empty students list when no students are given', async () => {
    const result = await buildScenario({})

    expect(result).toEqual({ students: [] })
    expect(mockedRegisterStudent).not.toHaveBeenCalled()
  })

  test('registers each student and maps the temp id to the real id', async () => {
    mockRegisteredStudent('real-id-1')
    mockRegisteredStudent('real-id-2')

    const result = await buildScenario({
      students: [
        { kind: 'student', id: 'student-1' },
        { kind: 'student', id: 'student-2' },
      ],
    })

    expect(mockedRegisterStudent).toHaveBeenCalledTimes(2)
    expect(result.students).toEqual([
      { tempId: 'student-1', id: 'real-id-1' },
      { tempId: 'student-2', id: 'real-id-2' },
    ])
  })

  test('passes through spec-provided fields and fills the rest with valid defaults', async () => {
    mockRegisteredStudent('real-id-1')

    await buildScenario({
      students: [
        {
          kind: 'student',
          id: 'student-1',
          email: 'given@example.com',
          gradeLevel: '9th',
        },
      ],
    })

    const payload = mockedRegisterStudent.mock.calls[0][0]
    expect(payload.email).toBe('given@example.com')
    expect(payload.gradeLevel).toBe('9th')
    // Defaults must satisfy the registration requirements.
    expect(payload.firstName).toBeTruthy()
    expect(payload.lastName).toBeTruthy()
    expect(payload.password).toBeTruthy()
  })
})
