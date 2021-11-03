import { namesAreValid } from '../../utils/auth-utils'

describe('name validator', () => {
  test('accepts two valid names', () => {
    expect(namesAreValid('Somebodys', 'Name')).toEqual(true)
  })
  test('accepts names with spaces', () => {
    expect(namesAreValid('Name With', 'Spaces')).toEqual(true)
  })
  test('accepts names with hyphens', () => {
    expect(namesAreValid('Name', 'Hyphenated-Surname')).toEqual(true)
  })
  test('rejects a valid first name and URL last name', () => {
    expect(namesAreValid('Somebodys', 'https://bit.ly')).toEqual(false)
  })
  test('rejects a URL first name and valid last name', () => {
    expect(namesAreValid('https://bit.ly', 'Name')).toEqual(false)
  })
  test('rejects a URL mixed in with other text in at least one name', () => {
    expect(
      namesAreValid('Congratulations! Visit https://bit.ly!', 'Name')
    ).toEqual(false)
  })
})
