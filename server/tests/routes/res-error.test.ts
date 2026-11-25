import { resError } from '../../router/res-error'
import { NotAllowedError } from '../../models/Errors'

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

  test('keeps an explicit status over the error class status', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    resError(res as any, new NotAllowedError('Not yours'), 400)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      err: 'Not yours',
      clientMessage: 'Not yours',
    })
  })
})
