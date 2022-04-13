import { ONBOARDING_STATUS } from '../../constants'
import {
  asDate,
  asFunction,
  asArray,
  asBoolean,
  asNumber,
  asString,
  asEnum,
  asUnion,
} from '../../utils/type-utils'

describe('asNumber', () => {
  test('Should pass if given a type Date', () => {
    const id = 5 as unknown
    expect(() => asNumber(id)).not.toThrow()
  })

  test('Should pass if given a string coercible to a number', () => {
    expect(() => asNumber('5')).not.toThrow()
    expect(() => asNumber('.50')).not.toThrow()
    expect(() => asNumber('5.0')).not.toThrow()
  })

  test('Should throw error if not given a number', () => {
    expect(() => asNumber({} as unknown)).toThrow()
    expect(() => asNumber('hello' as unknown)).toThrow()
    expect(() => asNumber(null as unknown)).toThrow()
    expect(() => asNumber(undefined as unknown)).toThrow()
    expect(() => asNumber([] as unknown)).toThrow()
  })
})

describe('asArray', () => {
  test('Should pass if given correct array type', () => {
    expect(() => asArray(asNumber)([1, 2, 3] as unknown)).not.toThrow()
    expect(() => asArray(asString)(['1', '2', '3'] as unknown)).not.toThrow()
    expect(() =>
      asArray(asBoolean)([true, false, true] as unknown)
    ).not.toThrow()
  })

  test('Should throw error if given wrong type', () => {
    expect(() => asArray(asBoolean)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asString)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asNumber)(['hey', 'hello', 'hi'] as unknown)).toThrow()
  })
})

describe('asDate', () => {
  test('Should pass if given a type Date', () => {
    const id = new Date() as unknown
    expect(() => asDate(id)).not.toThrow()
  })

  test('Should throw error if not given an ObjectId', () => {
    expect(() => asDate({} as unknown)).toThrow()
    expect(() => asDate(1 as unknown)).toThrow()
    expect(() => asDate('hello' as unknown)).toThrow()
    expect(() => asDate(null as unknown)).toThrow()
    expect(() => asDate(undefined as unknown)).toThrow()
    expect(() => asDate([] as unknown)).toThrow()
  })
})

describe('asFunction', () => {
  test('Should pass if given a type Function', () => {
    function namedFunction() {
      return ''
    }
    const arrowFunction = () => ''
    const anonymousFunction = function() {
      return ''
    }
    expect(() => asFunction(namedFunction)).not.toThrow()
    expect(() => asFunction(arrowFunction)).not.toThrow()
    expect(() => asFunction(anonymousFunction)).not.toThrow()
  })

  test('Should throw error if not given an ObjectId', () => {
    expect(() => asFunction({} as unknown)).toThrow()
    expect(() => asFunction(1 as unknown)).toThrow()
    expect(() => asFunction('hello' as unknown)).toThrow()
    expect(() => asFunction(null as unknown)).toThrow()
    expect(() => asFunction(undefined as unknown)).toThrow()
    expect(() => asFunction([] as unknown)).toThrow()
  })
})

describe('asEnum', () => {
  test('Should pass if given a type ONBOARDING_STATUS', () => {
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(ONBOARDING_STATUS.INACTIVE)
    ).not.toThrow()
  })

  test('Should throw error if not given an ONBOARDING_STATUS', () => {
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)({} as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(1 as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)('hello' as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(null as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(undefined as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)([] as unknown)
    ).toThrow()
  })
})

describe('asUnion', () => {
  test('Should pass if one of the union types', () => {
    expect(() =>
      asUnion<number | string>([asNumber, asString])(2)
    ).not.toThrow()
    expect(() =>
      asUnion<number | string>([asNumber, asString])('2')
    ).not.toThrow()
  })

  test('Should throw error if not one of the union types', () => {
    expect(() =>
      asUnion<number | string>([asNumber, asString])({} as unknown)
    ).toThrow()
    expect(() =>
      asUnion<boolean | string>([asBoolean, asString])(1 as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | boolean>([asNumber, asBoolean])('hello' as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | string[]>([asNumber, asArray(asString)])(null as unknown)
    ).toThrow()
    expect(() =>
      asUnion<string | boolean>([asString, asBoolean])(undefined as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | string>([asNumber, asString])([] as unknown)
    ).toThrow()
  })
})
