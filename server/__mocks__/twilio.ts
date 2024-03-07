// See https://www.twilio.com/docs/messaging/api/message-resource#message-properties
export const mockedCreateMessageResponse = {
  sid: '123456789',
  to: '+18180000001',
  from: '+18180000002',
  body: 'Mocked message body',
}

// See https://www.twilio.com/docs/verify/api/verification
export const mockedCreateVerificationResponse = {
  to: '+18180000001',
  from: '+18180000002',
  channel: 'sms',
}

const twilioMock = {
  messages: {
    create: jest.fn().mockResolvedValue(mockedCreateMessageResponse),
  },
  verify: {
    services: jest.fn().mockReturnValue({
      verifications: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue(mockedCreateVerificationResponse),
      }),
    }),
  },
}

export default () => twilioMock
