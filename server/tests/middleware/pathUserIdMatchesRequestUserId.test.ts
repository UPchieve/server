import { getDbUlid } from '../../models/pgUtils'
import { pathUserIdMatchesRequestUserId } from '../../middleware/pathUserIdMatchesRequestUserId'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'
import { DEFAULT_ERROR_MESSAGE } from '../../models/Errors'

describe('pathUserIdMatchesRequestUserIdMiddleware', () => {
  const mockNext = jest.fn()
  const res: any = new Response()
  const user = {
    id: getDbUlid(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  const getRequest = (pathUserId: any | undefined, requestUser: any) => {
    const request = new Request()
    request.params = { userId: pathUserId }
    return {
      ...request,
      user: requestUser,
    } as any
  }

  it('Positive case: passes the request to next() without error if the user IDs match', async () => {
    const req = getRequest(user.id, { id: user.id })
    pathUserIdMatchesRequestUserId(req, res, mockNext)
    expect(mockNext).toHaveBeenCalledWith()
  })

  it.each([
    [user.id, { id: 'test-' + user.id }],
    ['test-' + user.id, { id: user.id }],
    [user.id, undefined],
    [undefined, { id: user.id }],
    [null, { id: user.id }],
    [user.id, null],
    [null, null],
    [undefined, undefined],
  ])(
    'Logs an error message and throws an error if the user IDs do not match or either is undefined/null (%s vs. %s)',
    async (pathUserId, reqUser) => {
      const req = getRequest(pathUserId, reqUser)
      pathUserIdMatchesRequestUserId(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledWith(new Error(DEFAULT_ERROR_MESSAGE))
    }
  )
})
