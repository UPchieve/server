/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import {
  getLatestEmailNotifications,
  getVolunteersNotifiedSince,
} from '../../models/Notification'
import { buildNotification } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import moment from 'moment'
import { createTestUser, createTestVolunteer } from './seed-utils'

describe('Notification repo', () => {
  const dbClient = getClient()
  const SMS_METHOD_ID = 1
  const PUSH_METHOD_ID = 2
  const VOICE_METHOD_ID = 3
  const EMAIL_METHOD_ID = 4

  describe('getVolunteersNotifiedSince', () => {
    it('returns volunteers who received SMS notifications since the given time', async () => {
      const volunteer1 = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer1.id)
      const volunteer2 = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer2.id)
      const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate()
      const fourMinutesAgo = moment().subtract(4, 'minutes').toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer1.id,
          sentAt: fourMinutesAgo,
          methodId: SMS_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer2.id,
          sentAt: fourMinutesAgo,
          methodId: SMS_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(fiveMinutesAgo, 'sms')

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result).toContain(volunteer1.id)
      expect(result).toContain(volunteer2.id)
    })

    it('does not return volunteers notified before the given time', async () => {
      const volunteer = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer.id)
      const tenMinutesAgo = moment().subtract(10, 'minutes').toDate()
      const tenMinutesOneSecondAgo = moment()
        .subtract(10, 'minutes')
        .subtract(1, 'second')
        .toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: tenMinutesOneSecondAgo,
          methodId: SMS_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(tenMinutesAgo, 'sms')

      expect(result).not.toContain(volunteer.id)
    })

    it('only returns volunteers who were notified with the specified notification method', async () => {
      const volunteer = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer.id)
      const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate()
      const fourMinutesAgo = moment().subtract(4, 'minutes').toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: fourMinutesAgo,
          methodId: PUSH_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: fourMinutesAgo,
          methodId: VOICE_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: fourMinutesAgo,
          methodId: EMAIL_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(fiveMinutesAgo, 'sms')

      expect(result).not.toContain(volunteer.id)
    })

    it('returns distinct volunteer IDs when a volunteer has multiple notifications', async () => {
      const volunteer = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer.id)
      const fifteenMinutesAgo = moment().subtract(15, 'minutes').toDate()
      const twoMinutesAgo = moment().subtract(2, 'minutes').toDate()
      const oneMinuteAgo = moment().subtract(1, 'minutes').toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: twoMinutesAgo,
          methodId: EMAIL_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: oneMinuteAgo,
          methodId: EMAIL_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(
        fifteenMinutesAgo,
        'email'
      )

      const occurrences = result.filter((id) => id === volunteer.id).length
      expect(occurrences).toBe(1)
    })

    it('returns empty array when no volunteers were notified since the given time', async () => {
      const volunteer = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer.id)
      const twoMinutesAgo = moment().subtract(2, 'minutes').toDate()
      const oneMinuteAgo = moment().subtract(1, 'minute').toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: twoMinutesAgo,
          methodId: PUSH_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(oneMinuteAgo, 'push')

      expect(result).not.toContain(volunteer.id)
    })

    it('includes notifications sent exactly at the boundary time', async () => {
      const volunteer = await createTestUser(dbClient)
      await createTestVolunteer(dbClient, volunteer.id)
      const boundaryTime = moment().subtract(5, 'minutes').toDate()
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: volunteer.id,
          sentAt: boundaryTime,
          methodId: VOICE_METHOD_ID,
          sessionId: undefined,
        }),
        dbClient
      )

      const result = await getVolunteersNotifiedSince(boundaryTime, 'voice')

      expect(result).toContain(volunteer.id)
    })
  })

  describe('getLatestEmailNotifications', () => {
    it('returns the latest matching email notification per user and template', async () => {
      const firstUser = await createTestUser(dbClient)
      const secondUser = await createTestUser(dbClient)
      const firstSentAt = new Date('2026-10-01T12:00:00.000Z')
      const latestSentAt = new Date('2026-10-02T12:00:00.000Z')
      const templateId = 'campaign-a1'

      for (const sentAt of [firstSentAt, latestSentAt]) {
        await insertSingleRow(
          'notifications',
          buildNotification({
            userId: firstUser.id,
            sentAt,
            methodId: EMAIL_METHOD_ID,
            sessionId: undefined,
            emailTemplateId: templateId,
          }),
          dbClient
        )
      }
      await insertSingleRow(
        'notifications',
        buildNotification({
          userId: secondUser.id,
          sentAt: firstSentAt,
          methodId: EMAIL_METHOD_ID,
          sessionId: undefined,
          emailTemplateId: templateId,
        }),
        dbClient
      )

      const results = await getLatestEmailNotifications(
        [firstUser.id, secondUser.id],
        [templateId],
        dbClient
      )

      expect(results).toEqual(
        expect.arrayContaining([
          {
            userId: firstUser.id,
            emailTemplateId: templateId,
            sentAt: latestSentAt,
          },
          {
            userId: secondUser.id,
            emailTemplateId: templateId,
            sentAt: firstSentAt,
          },
        ])
      )
      expect(results).toHaveLength(2)
    })

    it('ignores other users, templates, and notification methods', async () => {
      const includedUser = await createTestUser(dbClient)
      const otherUser = await createTestUser(dbClient)
      const sentAt = new Date('2026-10-03T12:00:00.000Z')

      for (const notification of [
        { userId: includedUser.id, methodId: EMAIL_METHOD_ID, template: 'r1' },
        { userId: includedUser.id, methodId: EMAIL_METHOD_ID, template: 'r2' },
        { userId: includedUser.id, methodId: SMS_METHOD_ID, template: 'r1' },
        { userId: otherUser.id, methodId: EMAIL_METHOD_ID, template: 'r1' },
      ]) {
        await insertSingleRow(
          'notifications',
          buildNotification({
            userId: notification.userId,
            sentAt,
            methodId: notification.methodId,
            sessionId: undefined,
            emailTemplateId: notification.template,
          }),
          dbClient
        )
      }

      const results = await getLatestEmailNotifications(
        [includedUser.id],
        ['r1'],
        dbClient
      )

      expect(results).toEqual([
        {
          userId: includedUser.id,
          emailTemplateId: 'r1',
          sentAt,
        },
      ])
    })
  })
})
