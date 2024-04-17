import { stringToBoolean } from '../../utils/string-to-boolean'

describe('stringToBoolean', () => {
  it.each([
    // given, expected
    ['true', true],
    ['false', false],
    [' true ', true],
    ['tRUE', true],
    ['FALSE', false],
    ['False', false],
    ['something else entirely', false],
  ])(
    'Returns the expected boolean value when stringVal=%s',
    (given: string, expected: boolean) => {
      expect(stringToBoolean(given)).toEqual(expected)
    }
  )
})
