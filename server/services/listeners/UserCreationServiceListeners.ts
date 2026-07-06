import { USER_EVENTS } from '../../constants'
import register from './register'
import * as MailService from '../MailService'
import logger from '../../logger'
import { Uuid } from '../../models/pgUtils'

export function listeners() {
  register(USER_EVENTS.USER_CREATED, MailService.createContact, 'createContact')
  register(
    USER_EVENTS.USER_CREATED,
    async (userId: Uuid) => {
      logger.info({ userId }, 'Account created')
    },
    'logAccountCreation'
  )
}
