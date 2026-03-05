import { mocked } from 'jest-mock'
import { isBlockedEmailDomain } from '../../utils/domain-utils'
import * as EmailDomainBlocklistRepo from '../../models/EmailDomainBlocklist/queries'

jest.mock('../../models/EmailDomainBlocklist/queries')
const mockedRepo = mocked(EmailDomainBlocklistRepo)

describe('isBlockedEmailDomain', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('returns true when email domain is in blocklist', async () => {
    mockedRepo.getEmailDomainBlocklistEntry.mockResolvedValueOnce({
      id: 1,
      domain: 'blocked.com',
    })

    const result = await isBlockedEmailDomain('user@blocked.com')

    expect(result).toBe(true)
    expect(mockedRepo.getEmailDomainBlocklistEntry).toHaveBeenCalledWith(
      'blocked.com'
    )
  })

  test('returns false when email domain is not in blocklist', async () => {
    mockedRepo.getEmailDomainBlocklistEntry.mockResolvedValueOnce(undefined)

    const result = await isBlockedEmailDomain('user@allowed.com')

    expect(result).toBe(false)
    expect(mockedRepo.getEmailDomainBlocklistEntry).toHaveBeenCalledWith(
      'allowed.com'
    )
  })

  test('extracts domain correctly from email address', async () => {
    mockedRepo.getEmailDomainBlocklistEntry.mockResolvedValueOnce(undefined)

    await isBlockedEmailDomain('test.user+tag@subdomain.example.com')

    expect(mockedRepo.getEmailDomainBlocklistEntry).toHaveBeenCalledWith(
      'subdomain.example.com'
    )
  })
})
