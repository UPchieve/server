import { isGroupAdmin } from '../../router/api/nths-groups'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { getDbUlid } from '../../models/pgUtils'
jest.mock('../../services/NTHSGroupsService')
jest.mock('express')

const mockNTHSGroupsService = jest.mocked(NTHSGroupsService)
describe('isGroupAdmin', () => {
  const userId = getDbUlid()
  const groupId = getDbUlid()
  const request = {
    user: {
      id: userId,
    },
    params: {
      groupId,
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Gives HTTP 403 if the requesting user is not an admin', async () => {
    mockNTHSGroupsService.getGroupMember.mockResolvedValue({
      roleName: 'member',
      nthsGroupId: groupId,
      userId,
      title: 'some other title',
      joinedAt: new Date(),
      updatedAt: new Date(),
    })
    const mockNextFunction = jest.fn()
    const mockStatus = jest.fn().mockReturnThis()
    const mockJson = jest.fn()
    const mockResponse = {
      status: mockStatus,
      json: mockJson,
    }
    await isGroupAdmin(request as any, mockResponse as any, mockNextFunction)
    expect(mockNextFunction).not.toHaveBeenCalled()
    expect(mockStatus).toHaveBeenCalledWith(403)
    expect(mockJson).toHaveBeenCalledWith({ err: 'Unauthorized' })
  })

  it('Passes the middleware if the user is an admin of this group', async () => {
    mockNTHSGroupsService.getGroupMember.mockResolvedValue({
      roleName: 'admin',
      nthsGroupId: groupId,
      userId,
      title: 'president',
      joinedAt: new Date(),
      updatedAt: new Date(),
    })
    const nextFunctionMock = jest.fn()
    await isGroupAdmin(request as any, {} as any, nextFunctionMock)
    expect(nextFunctionMock).toHaveBeenCalledTimes(1)
  })
})
