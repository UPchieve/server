import sgMail from '@sendgrid/mail'
import {
  sendVerification,
  sendNTHSCandidateApplicationDenied,
} from '../../services/MailService'
import { getEmailDomainBlocklistEntry } from '../../models/EmailDomainBlocklist'

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))
jest.mock('../../models/EmailDomainBlocklist')
jest.mock('../../utils/environments')

const mockedSend = jest.mocked(sgMail.send)
const mockedGetBlocklistEntry = jest.mocked(getEmailDomainBlocklistEntry)

function sendBulk(addresses: string[]) {
  return sendNTHSCandidateApplicationDenied(
    addresses.map((email) => ({ email, firstName: email.split('@')[0] }))
  )
}

beforeEach(() => {
  jest.resetAllMocks()
  mockedGetBlocklistEntry.mockImplementation(async (domain) =>
    domain === 'blocked.com' ? { id: 1, domain } : undefined
  )
})

describe('email domain blocking', () => {
  test('sends individual email to an allowed domain', async () => {
    await sendVerification('user@allowed.com', 'token')

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@allowed.com' })
    )
  })

  test.each(['user@blocked.com', 'User@BLOCKED.COM'])(
    'skips individual email to %s, including verification mail',
    async (email) => {
      await expect(sendVerification(email, 'token')).resolves.toBeUndefined()

      expect(mockedSend).not.toHaveBeenCalled()
      expect(mockedGetBlocklistEntry).toHaveBeenCalledWith('blocked.com')
    }
  )

  test('filters bulk email send to only send to non-blocked domains', async () => {
    await sendBulk([
      'first@allowed.com',
      'spam@blocked.com',
      'second@allowed.com',
      'spam@mailinator.com',
    ])

    expect(mockedSend).toHaveBeenCalledTimes(1)
    expect(mockedSend).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          to: 'first@allowed.com',
          dynamic_template_data: { firstName: 'first' },
        }),
        expect.objectContaining({
          to: 'second@allowed.com',
          dynamic_template_data: { firstName: 'second' },
        }),
      ],
      true
    )
  })
})
