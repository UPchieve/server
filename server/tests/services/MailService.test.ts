import { sendContactFormEmail } from '../../services/MailService/smtp'
// const MailService = require('../../services/MailService/index')
// import { MailtrapClient, Message } from 'mailtrap-client'
// import axios from 'axios'

jest.setTimeout(15000)

// const mailtrapApiToken: string = process.env.SUBWAY_DEV_MAILTRAP_API_TOKEN
// const devMailtrapAddress: string = process.env.SUBWAY_DEV_MAILTRAP_ADDRESS
// const devMailtrapInboxId = Number(process.env.SUBWAY_DEV_MAILTRAP_INBOX_ID)
//
// const client = new MailtrapClient(mailtrapApiToken)

/**
 * @group email
 */
test.todo('contact form email sends correctly', async () => {
  try {
    await sendContactFormEmail({
      email: 'test@test.com',
      message: 'This is some test feedback.',
      topic: 'General feedback',
    })
  } catch (err) {
    expect(err).toBeUndefined()
  }
})

// TODO: wait to hear back from mailtrap-client author on intended usage, since it uses fetch
// which is not available in a node runtime
// this is POC code that we'll come back to fully implement when we have a working mailtrap sdk
/**
 * @group email
 */
// test('first attempted quiz failed sends correctly', async () => {
//   const firstName = 'Testy'
//   const category = 'Pre-algebra'
//   const subjectLine = `Thanks for taking our ${category} quiz!`
//   MailService.sendFailedFirstAttemptedQuiz({category, email: devMailtrapAddress, firstName})
//   await new Promise(resolve => {
//     setTimeout(resolve, 5000)
//   })
//   const messages = await client.messages.getMessages(devMailtrapInboxId)
//   const categoryMessages = messages.filter(message => {
//     return message.subject === subjectLine
//   })
//   const messageBodies = await Promise.all(categoryMessages.map(message => {
//     return axios({
//       url: `https://mailtrap.io${message.raw_path}`,
//       method: 'get',
//       headers: {
//         'Api-Token': mailtrapApiToken
//       }
//     })
//   })) as unknown as string[]
//   const correctMessages = messageBodies.filter(body => {
//     return body.includes(firstName) && body.includes(category) && body.includes(devMailtrapAddress)
//   })
//   expect(correctMessages.length).toBeGreaterThan(0)
// })
