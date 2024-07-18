import { getEnumKeyByEnumValue } from '../../utils/enum-utils'

enum NumericEnum {
  foo,
  bar = 1,
}

enum StringEnum {
  Foo = 'foo',
}

describe('Reverse map getter', () => {
  test('Implicit integer value', () => {
    expect(getEnumKeyByEnumValue(NumericEnum, NumericEnum.foo)).toEqual('foo')
  })
  test('Explicit integer value', () => {
    expect(getEnumKeyByEnumValue(NumericEnum, NumericEnum.bar)).toEqual('bar')
  })
  test('String value', () => {
    expect(getEnumKeyByEnumValue(StringEnum, StringEnum.Foo)).toEqual('Foo')
  })
})
