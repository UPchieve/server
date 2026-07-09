import {
  resolveStudent,
  StudentDefaults,
  StudentSpec,
} from '../../../services/E2EScenario/transform'

const DEFAULTS: StudentDefaults = {
  email: 'default@upchieve.org',
  firstName: 'DefaultFirst',
  lastName: 'DefaultLast',
  password: 'DefaultPass1',
}

describe('resolveStudent', () => {
  test('echoes the spec id back as tempId', () => {
    const spec: StudentSpec = { kind: 'student', id: 'student-1' }

    const resolved = resolveStudent(spec, DEFAULTS)

    expect(resolved.tempId).toBe('student-1')
  })

  test('fills every field from defaults when the spec omits them', () => {
    const spec: StudentSpec = { kind: 'student', id: 'student-1' }

    const resolved = resolveStudent(spec, DEFAULTS)

    expect(resolved.payload).toEqual({
      email: DEFAULTS.email,
      firstName: DEFAULTS.firstName,
      lastName: DEFAULTS.lastName,
      password: DEFAULTS.password,
      gradeLevel: undefined,
    })
  })

  test('prefers spec values over defaults when provided', () => {
    const spec: StudentSpec = {
      kind: 'student',
      id: 'student-2',
      email: 'override@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'Override123',
      gradeLevel: '10th',
    }

    const resolved = resolveStudent(spec, DEFAULTS)

    expect(resolved).toEqual({
      tempId: 'student-2',
      payload: {
        email: 'override@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        password: 'Override123',
        gradeLevel: '10th',
      },
    })
  })

  test('is pure: does not mutate its inputs', () => {
    const spec: StudentSpec = { kind: 'student', id: 'student-3' }
    const specCopy = { ...spec }
    const defaultsCopy = { ...DEFAULTS }

    resolveStudent(spec, DEFAULTS)

    expect(spec).toEqual(specCopy)
    expect(DEFAULTS).toEqual(defaultsCopy)
  })
})
