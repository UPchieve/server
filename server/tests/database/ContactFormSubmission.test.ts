/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { saveContactFormSubmission } from '../../services/ContactFormService'
import * as MailService from '../../services/MailService'

jest.mock('../../services/MailService')

// No production read returns contact form submissions.
async function getSubmissionsByEmail(userEmail: string) {
  const result = await getClient().query(
    'SELECT user_id, user_email, topic, message FROM contact_form_submissions WHERE user_email = $1',
    [userEmail]
  )
  return result.rows
}

describe('saveContactFormSubmission', () => {
  it('Saves a signed-out submission with each field in its column', async () => {
    await saveContactFormSubmission({
      userId: '',
      userEmail: 'Visitor@Example.com',
      topic: 'Technical issue',
      message: 'I Cannot log in',
    })

    expect(await getSubmissionsByEmail('visitor@example.com')).toEqual([
      {
        user_id: null,
        user_email: 'visitor@example.com',
        topic: 'Technical issue',
        message: 'I Cannot log in',
      },
    ])
  })

  it('Sends staff the visitor email, topic and message in their own fields', async () => {
    await saveContactFormSubmission({
      userId: '',
      userEmail: 'mailtest@example.com',
      topic: 'General question',
      message: 'Where are the tutors?',
    })

    expect(MailService.sendContactForm).toHaveBeenCalledWith({
      email: 'mailtest@example.com',
      topic: 'General question',
      message: 'Where are the tutors?',
    })
  })
})
