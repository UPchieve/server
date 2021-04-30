import { sendContactFormEmail } from '../../services/MailService/smtp'

test('contact form email sends correctly', async () => {
  try {
    await sendContactFormEmail({
      email: 'test@test.com',
      message: 'This is some test feedback.',
      topic: 'General feedback'
    })
  } catch (err) {
    expect(err).toBeUndefined()
  }
})
