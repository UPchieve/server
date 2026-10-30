import { mocked } from 'jest-mock'
import config from '../../../config'
import { GRADES } from '../../../constants'
import CleverStrategy, {
  TCleverPassportProfile,
} from '../../../router/auth/clever-strategy'
import * as CleverAPIService from '../../../services/CleverAPIService'

jest.mock('../../../services/CleverAPIService', () => ({
  ...jest.requireActual('../../../services/CleverAPIService'),
  getUserProfile: jest.fn(),
  getTeacherClasses: jest.fn(),
  getTeacherStudents: jest.fn(),
}))
const mockedCleverAPIService = mocked(CleverAPIService)

type CleverUserProfile = Awaited<
  ReturnType<typeof CleverAPIService.getUserProfile>
>

function buildCleverUser(roles: {
  student?: {
    grade: string
  }
  teacher?: any
}): CleverUserProfile {
  return {
    name: { first: 'Happy', last: 'Halloween', middle: 'Boo' },
    roles,
  }
}

async function getProfile(
  user: CleverUserProfile
): Promise<TCleverPassportProfile | undefined> {
  mockedCleverAPIService.getUserProfile.mockResolvedValue(user)
  const strategy = new CleverStrategy({ callbackURL: 'callback' }, jest.fn())
  return new Promise((resolve, reject) => {
    strategy.userProfile('access-token', (err: unknown, profile: unknown) =>
      err ? reject(err) : resolve(profile as TCleverPassportProfile)
    )
  })
}

beforeEach(() => {
  jest.resetAllMocks()
})

describe('CleverStrategy.userProfile', () => {
  beforeAll(() => {
    config.cleverClientId = 'clever-client-id'
    config.cleverClientSecret = 'clever-client-secret'
  })

  test('sets the student grade level from Clever', async () => {
    const profile = await getProfile(
      buildCleverUser({ student: { grade: '9' } })
    )
    expect(profile?.userType).toBe('student')
    expect(profile?.gradeLevel).toBe(GRADES.NINTH)
  })

  test('leaves the grade level unset when Clever has no usable grade', async () => {
    const profile = await getProfile(
      buildCleverUser({
        student: { grade: 'Kindergarten' },
      })
    )

    expect(profile?.userType).toBe('student')
    expect(profile?.gradeLevel).toBeUndefined()
  })

  test('leaves the grade level unset for teachers', async () => {
    const profile = await getProfile(
      buildCleverUser({
        teacher: {},
      })
    )

    expect(profile?.userType).toBe('teacher')
    expect(profile?.gradeLevel).toBeUndefined()
  })
})
