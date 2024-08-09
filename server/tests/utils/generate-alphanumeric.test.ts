import generateAlphanumericOfLength from '../../utils/generate-alphanumeric'

describe('generateAlphanumericOfLength', () => {
  const REGEX = /^[A-Z0-9]+$/

  test('creates an alphanumeric string of the length specified', () => {
    const s1 = generateAlphanumericOfLength(10)
    expect(s1.length).toBe(10)
    expect(REGEX.test(s1)).toBe(true)

    const s2 = generateAlphanumericOfLength(100)
    expect(s2.length).toBe(100)
    expect(REGEX.test(s2)).toBe(true)

    const s3 = generateAlphanumericOfLength(0)
    expect(s3.length).toBe(0)

    const s4 = generateAlphanumericOfLength(-1)
    expect(s4.length).toBe(0)

    const s5 = generateAlphanumericOfLength(1)
    expect(s5.length).toBe(1)
    expect(REGEX.test(s5)).toBe(true)
  })
})
