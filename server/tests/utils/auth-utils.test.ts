import {
  checkNames,
  checkPassword,
  RegistrationError,
} from '../../utils/auth-utils'

describe('name validator', () => {
  test('accepts two valid names', async () => {
    expect(checkNames('Somebodys', 'Name')).toBeUndefined()
  })
  test('accepts names with spaces', async () => {
    expect(checkNames('Name With', 'Spaces')).toBeUndefined()
  })
  test('accepts names with hyphens', async () => {
    expect(checkNames('Name', 'Hyphenated-Surname')).toBeUndefined()
  })
  test('rejects a valid first name and URL last name', async () => {
    expect(() => {
      checkNames('Somebodys', 'https://bit.ly')
    }).toThrow()
  })
  test('rejects a URL first name and valid last name', async () => {
    expect(() => {
      checkNames('https://bit.ly', 'Name')
    }).toThrow()
  })
  test('rejects a URL mixed in with other text in at least one name', async () => {
    expect(() => {
      checkNames('Congratulations! Visit https://bit.ly!', 'Name')
    }).toThrow()
  })
})

describe('password validator', () => {
  test('password must be at least 8 characters long', async () => {
    expect(() => {
      checkPassword('abcDE67')
    }).toThrow(new RegistrationError('Password must be 8 characters or longer'))
  })

  test('password must contain a number', async () => {
    expect(() => {
      checkPassword('a-B-c-D-')
    }).toThrow(
      new RegistrationError('Password must contain at least one number')
    )
  })

  test('password must contain a lowercase letter', async () => {
    expect(() => {
      checkPassword('ABC--456')
    }).toThrow(
      new RegistrationError(
        'Password must contain at least one lowercase letter'
      )
    )
  })

  test('password must contain an uppercase letter', async () => {
    expect(() => {
      checkPassword('abc--456')
    }).toThrow(
      new RegistrationError(
        'Password must contain at least one uppercase letter'
      )
    )
  })

  test('valid password', async () => {
    expect(checkPassword('abcdABCD1234!@#$')).toBe(true)
  })
})
