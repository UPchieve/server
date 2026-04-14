import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp } from '../../mock-app'
import * as ContactRouter from '../../../router/contact'
import * as ContactFormService from '../../../services/ContactFormService'
import { RepoCreateError } from '../../../models/Errors'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/ContactFormService')
jest.mock('../../../logger')
jest.mock('newrelic', () => ({
  startSegment: jest.fn(
    async (_name: string, _record: boolean, handler: () => unknown) =>
      await handler()
  ),
}))

const mockedContactFormService = mocked(ContactFormService)

const app = mockApp()
ContactRouter.routes(app)

const agent = request.agent(app)

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeContact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api-public/contact/send', () => {
    test('saves contact form submission and returns success message', async () => {
      const payload = {
        topic: 'General question',
        userEmail: 'student@example.com',
        message: 'I need help with my account',
      }
      mockedContactFormService.saveContactFormSubmission.mockResolvedValueOnce()

      const response = await sendPost('/api-public/contact/send', payload)
      expect(response.status).toBe(200)
      expect(
        mockedContactFormService.saveContactFormSubmission
      ).toHaveBeenCalledWith(payload)
      expect(response.body).toEqual({
        message: 'contact form submission has been sent',
      })
    })

    test('returns 400 when saveContactFormSubmission throws RepoCreateError', async () => {
      const errorMessage = 'Unable to create contact form submission'
      const payload = {
        topic: 'Technical issue',
        userEmail: 'student@example.com',
        message: 'The tests are broken',
      }
      mockedContactFormService.saveContactFormSubmission.mockRejectedValueOnce(
        new RepoCreateError(errorMessage)
      )

      const response = await sendPost('/api-public/contact/send', payload)
      expect(response.status).toBe(400)
      expect(
        mockedContactFormService.saveContactFormSubmission
      ).toHaveBeenCalledWith(payload)
      expect(response.body).toEqual({
        error: errorMessage,
      })
    })

    test('returns 500 when saveContactFormSubmission throws non-RepoCreateError', async () => {
      const errorMessage = 'Error'
      const payload = {
        topic: 'Other',
        userEmail: 'student@example.com',
        message: 'Something unexpected happened.',
      }

      mockedContactFormService.saveContactFormSubmission.mockRejectedValueOnce(
        new Error(errorMessage)
      )

      const response = await sendPost('/api-public/contact/send', payload)
      expect(response.status).toBe(500)
      expect(
        mockedContactFormService.saveContactFormSubmission
      ).toHaveBeenCalledWith(payload)
      expect(response.body).toEqual({
        error: errorMessage,
      })
    })
  })
})
