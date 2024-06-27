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
  ])(
    'Returns the expected boolean value when stringVal=%s',
    (given: string, expected: boolean) => {
      expect(stringToBoolean(given)).toEqual(expected)
    }
  )

  it.each([' something else ', 'tuxedo cat', '1', '0'])(
    "Throws an error if a string that is not 'true' or 'false' is provided",
    given => {
      expect(() => stringToBoolean(given)).toThrow(
        "Given string needs to resemble 'true' or 'false'"
      )
    }
  )
})
