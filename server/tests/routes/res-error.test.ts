import { resError } from '../../router/res-error'

jest.mock('../../logger')

describe('resError', () => {
  test('sends a generic 500 when a non-Error value is thrown', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    resError(res as any, 'raw thrown string')

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    })
  })
})
