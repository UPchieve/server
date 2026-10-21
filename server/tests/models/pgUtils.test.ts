import { ensureWriteOk } from '../../models/pgUtils'

describe('ensureWriteOk', () => {
  test('passes when the first row has a truthy ok', () => {
    expect(() => ensureWriteOk([{ ok: 'id' }])).not.toThrow()
  })

  test.each([
    { name: 'no rows', result: [] },
    { name: 'a row without ok', result: [{ ok: undefined }] },
    { name: 'a row with a falsy ok', result: [{ ok: false }] },
  ])('throws for $name', ({ result }) => {
    expect(() => ensureWriteOk(result)).toThrow(
      new Error('Write query did not return ok')
    )
  })

  test('appends the context to the message', () => {
    expect(() => ensureWriteOk([], { sessionId: 'abc', count: 2 })).toThrow(
      new Error('Write query did not return ok {"sessionId":"abc","count":2}')
    )
  })
})
