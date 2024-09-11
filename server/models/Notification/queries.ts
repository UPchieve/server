import {
  CreateEmailNotificationProps,
  EmailNotification,
  GetEmailNotificationsProps,
  Notification,
} from './types'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, makeSomeOptional, makeRequired } from '../pgUtils'

export async function getNotificationsByVolunteerId(
  userId: Ulid
): Promise<Notification[]> {
  try {
    const result = await pgQueries.getNotificationsByVolunteerId.run(
      { userId },
      getClient()
    )
    return result.map(v =>
      makeSomeOptional(v, ['sentAt', 'messageId', 'wasSuccessful'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SessionNotification = {
  volunteer: {
    // old firstName for legacy compatibility
    firstname: string
    volunteerPartnerOrg: string
  }
} & Notification

export async function getSessionNotificationsWithSessionId(
  sessionId: Ulid
): Promise<SessionNotification[]> {
  try {
    const result = await pgQueries.getSessionNotificationsWithSessionId.run(
      { sessionId },
      getClient()
    )
    return result.map(v => {
      const row: any = makeSomeOptional(v, [
        'sentAt',
        'messageId',
        'wasSuccessful',
        'volunteerPartnerOrg',
      ])
      row.volunteer = {
        firstname: row.firstName,
        volunteerPartnerOrg: row.volunteerPartnerOrg
          ? row.volunteerPartnerOrg
          : '',
      }
      delete row.firstName
      delete row.volunteerPartnerOrg
      return row as SessionNotification
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GentleWarning = {
  id: Ulid
  totalNotifications: number
  firstName: string
  email: string
}
export async function getNotificationsForGentleWarning(
  sessionId: Ulid
): Promise<GentleWarning[]> {
  try {
    const result = await pgQueries.getNotificationsForGentleWarning.run(
      { sessionId },
      getClient()
    )
    return result.map(v => {
      const ret = makeRequired(v)
      ret.email = ret.email.toLowerCase()
      return ret
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createEmailNotification(
  data: CreateEmailNotificationProps
): Promise<void> {
  try {
    const result = await pgQueries.createEmailNotification.run(
      {
        userId: data.userId,
        sessionId: data.sessionId ? data.sessionId : undefined,
        emailTemplateId: data.emailTemplateId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoCreateError('Insert query did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getEmailNotificationsByTemplateId(
  data: GetEmailNotificationsProps
): Promise<EmailNotification[]> {
  try {
    const result = await pgQueries.getEmailNotificationsByTemplateId.run(
      {
        emailTemplateId: data.emailTemplateId,
        userId: data.userId ? data.userId : undefined,
        start: data.start ? data.start : undefined,
        end: data.end ? data.end : undefined,
      },
      getClient()
    )
    return result.map(row => makeSomeOptional(row, ['sessionId']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
