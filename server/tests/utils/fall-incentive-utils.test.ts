import { mocked } from 'jest-mock'
import { getUserFallIncentiveData } from '../../utils/fall-incentive-utils'
import * as UserRepo from '../../models/User'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import { buildUser, buildUserProductFlags } from '../mocks/generate'

jest.mock('../../models/User')
jest.mock('../../models/UserProductFlags')
jest.mock('../../services/FeatureFlagService')

const mockedUserRepo = mocked(UserRepo)
const mockedUserProductFlagsRepo = mocked(UserProductFlagsRepo)
const mockedFeatureFlagsService = mocked(FeatureFlagsService)

describe('getUserFallIncentiveData', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should return undefined if no user is found', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(undefined)
    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no product flags are found', async () => {
    const user = buildUser()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(undefined)

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return undefined if no payload is found for the incentive feature flag', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags()
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      null
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test(`Should return undefined if enrollment flag does not match user's enrollment status`, async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags({
      fallIncentiveEnrollmentAt: undefined,
    })
    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      new Date().toISOString()
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toBeUndefined()
  })

  test('Should return user, product flags, and incentive program data if everything matches', async () => {
    const user = buildUser()
    const productFlags = buildUserProductFlags({
      fallIncentiveEnrollmentAt: new Date(),
    })
    const incentiveProgramDate = new Date().toISOString()

    mockedUserRepo.getUserContactInfoById.mockResolvedValueOnce(user)
    mockedUserProductFlagsRepo.getUPFByUserId.mockResolvedValueOnce(
      productFlags
    )
    mockedFeatureFlagsService.getFallIncentiveProgramPayload.mockResolvedValueOnce(
      incentiveProgramDate
    )

    const result = await getUserFallIncentiveData(user.id, true)
    expect(result).toEqual({
      user,
      productFlags,
      incentiveProgramDate: new Date(incentiveProgramDate),
    })
  })
})
