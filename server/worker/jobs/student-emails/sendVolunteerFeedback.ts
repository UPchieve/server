import { Job } from 'bull'
import { random } from 'lodash'
import { logError } from '../../logger'
import { sendVolunteerFeedbackToStudent } from '../../../services/MailService'
import { getUserContactInfo } from '../../../services/UserService'
import { Uuid } from '../../../models/pgUtils'
import { asUlid } from '../../../utils/type-utils'
import { getSessionById } from '../../../models/Session/index'
import config from '../../../config'

const INSPO_QUOTES = [
  {
    author: 'Eleanor Roosevelt',
    quote:
      'The future belongs to those who believe in the beauty of their dreams.',
  },
  {
    author: 'Nelson Mandela',
    quote: 'It always seems impossible until it’s done.',
  },
  {
    author: 'Maya Angelou',
    quote: 'You may encounter many defeats, but you must not be defeated.',
  },
  {
    author: 'Steve Jobs',
    quote:
      'Your time is limited, so don’t waste it living someone else’s life.',
  },
  {
    author: 'Henry David Thoreau',
    quote:
      'Go confidently in the direction of your dreams. Live the life you have imagined.',
  },
  {
    author: 'Michelle Obama',
    quote:
      'Don’t be afraid. Be focused. Be determined. Be hopeful. Be empowered.',
  },
  {
    author: 'Oprah Winfrey',
    quote:
      'Doing the best at this moment puts you in the best place for the next moment.',
  },
  {
    author: 'Confucius',
    quote:
      'Our greatest glory is not in never falling, but in rising every time we fall.',
  },
  {
    author: 'Martin Luther King Jr.',
    quote:
      'Faith is taking the first step even when you don’t see the whole staircase.',
  },
]

export type SendVolunteerFeedbackData = {
  sessionId: Uuid
  volunteerFeedback: string
}

export default async (job: Job<SendVolunteerFeedbackData>): Promise<void> => {
  const { data, name } = job

  try {
    const session = await getSessionById(data.sessionId)
    const student = await getUserContactInfo(session.studentId)
    const volunteer = await getUserContactInfo(asUlid(session.volunteerId))

    if (!volunteer || !student) {
      throw Error('No volunteer or student for session')
    }

    const upchieveDashboardLink = `https://${config.client.host}`

    const templates = [
      config.sendgrid.volunteerFeedbackForStudent,
      config.sendgrid.genericVolunteerFeedbackForStudent,
    ]
    const templateId = templates[random(2)]

    const inspriationalQuote =
      templateId === config.sendgrid.genericVolunteerFeedbackForStudent
        ? INSPO_QUOTES[random(INSPO_QUOTES.length)]
        : null

    const emailArgs = {
      recipientEmail: student.email,
      volunteerFirstName: volunteer.firstName,
      studentFirstName: student.firstName,
      volunteerFeedback: data.volunteerFeedback,
      upchieveDashboardLink,
      templateId,
      inspriationalQuote,
    }
    await sendVolunteerFeedbackToStudent(emailArgs)
  } catch (error) {
    const jobError = error as unknown as Error
    logError(jobError)
    throw new Error(
      `JOB: ${name} - Failed to email student for session id ${data.sessionId}`
    )
  }
}
