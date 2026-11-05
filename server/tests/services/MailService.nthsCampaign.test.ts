import sgMail from '@sendgrid/mail'
import config from '../../config'
import {
  sendNTHSCampaignEmail,
  NTHSCampaignEmailRecipient,
} from '../../services/MailService'
import {
  NTHS_CAMPAIGN_EMAILS,
  NTHSCampaignEmail,
} from '../../constants/nths-campaign'

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))

jest.mock('../../utils/environments', () => ({
  ...jest.requireActual('../../utils/environments'),
  isDevEnvironment: () => false,
  isE2eEnvironment: () => false,
}))

const mockedSend = jest.mocked(sgMail.send)

beforeEach(() => {
  mockedSend.mockReset()
})

describe('sendNTHSCampaignEmail', () => {
  test.each(NTHS_CAMPAIGN_EMAILS)(
    'uses the configured template for %s',
    async (email) => {
      const recipient = {
        to: 'president@example.com',
        dynamicData: { firstName: 'Taylor' },
      } as NTHSCampaignEmailRecipient<NTHSCampaignEmail>

      await sendNTHSCampaignEmail(email, [recipient])

      expect(mockedSend).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            to: recipient.to,
            templateId: config.sendgrid.nthsCandidateEngagment[email],
            dynamic_template_data: recipient.dynamicData,
          }),
        ],
        true
      )
    }
  )
})
