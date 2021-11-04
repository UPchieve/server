import { checkNames } from '../../utils/auth-utils'

describe('name validator', () => {
  test('accepts two valid names', async () => {
    await expect(checkNames('Somebodys', 'Name')).resolves.toBeUndefined()
  })
  test('accepts names with spaces', async () => {
    await expect(checkNames('Name With', 'Spaces')).resolves.toBeUndefined()
  })
  test('accepts names with hyphens', async () => {
    await expect(
      checkNames('Name', 'Hyphenated-Surname')
    ).resolves.toBeUndefined()
  })
  test('rejects a valid first name and URL last name', async () => {
    await expect(checkNames('Somebodys', 'https://bit.ly')).rejects.toThrow()
  })
  test('rejects a URL first name and valid last name', async () => {
    await expect(checkNames('https://bit.ly', 'Name')).rejects.toThrow()
  })
  test('rejects a URL mixed in with other text in at least one name', async () => {
    await expect(
      checkNames('Congratulations! Visit https://bit.ly!', 'Name')
    ).rejects.toThrow()
  })
})
