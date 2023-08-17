import { checkNames } from '../../utils/auth-utils'

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
