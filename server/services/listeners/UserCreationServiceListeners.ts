import { USER_EVENTS } from '../../constants'
import register from './register'
import * as MailService from '../MailService'

export function listeners() {
  register(USER_EVENTS.USER_CREATED, MailService.createContact, 'createContact')
}
