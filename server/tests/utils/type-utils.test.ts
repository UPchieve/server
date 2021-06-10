import { USER_BAN_REASON } from '../../constants'
import {
  asDate,
  asFunction,
  asObjectId,
  asArray,
  asBoolean,
  asNumber,
  asString,
  asEnum,
  asUnion
} from '../../utils/type-utils'
import { getObjectId } from '../generate'

describe('asArray', () => {
  test('Should pass if given correct array type', () => {
    expect(() => asArray(asNumber)([1, 2, 3] as unknown)).not.toThrow()
    expect(() => asArray(asString)(['1', '2', '3'] as unknown)).not.toThrow()
    expect(() =>
      asArray(asObjectId)([getObjectId(), getObjectId()] as unknown)
    ).not.toThrow()
  })

  test('Should throw error if given wrong type', () => {
    expect(() => asArray(asBoolean)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asString)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asNumber)(['1', '2', '3'] as unknown)).toThrow()
    expect(() => asArray(asNumber)(['1', '2', '3'] as unknown)).toThrow()
  })
})

describe('asObjectId', () => {
  test('Should pass if given an ObjectId', () => {
    const id = getObjectId() as unknown
    expect(() => asObjectId(id)).not.toThrow()
  })

  test('Should throw error if not given an ObjectId', () => {
    expect(() => asObjectId({} as unknown)).toThrow()
    expect(() => asObjectId(1 as unknown)).toThrow()
    expect(() => asObjectId('hello' as unknown)).toThrow()
    expect(() => asObjectId(null as unknown)).toThrow()
    expect(() => asObjectId(undefined as unknown)).toThrow()
    expect(() => asObjectId([] as unknown)).toThrow()
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
  test('Should pass if given a type BAN REASON', () => {
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)(USER_BAN_REASON.NON_US_SIGNUP)
    ).not.toThrow()
  })

  test('Should throw error if not given an BAN_REASON', () => {
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)({} as unknown)
    ).toThrow()
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)(1 as unknown)
    ).toThrow()
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)('hello' as unknown)
    ).toThrow()
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)(null as unknown)
    ).toThrow()
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)(undefined as unknown)
    ).toThrow()
    expect(() =>
      asEnum<USER_BAN_REASON>(USER_BAN_REASON)([] as unknown)
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
