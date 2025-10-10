/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getVolunteersNotifiedSince } from '../../models/Notification'
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
      await createTestVolunteer(volunteer1.id, dbClient)
      const volunteer2 = await createTestUser(dbClient)
      await createTestVolunteer(volunteer2.id, dbClient)
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
      await createTestVolunteer(volunteer.id, dbClient)
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
      await createTestVolunteer(volunteer.id, dbClient)
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
      await createTestVolunteer(volunteer.id, dbClient)
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
      await createTestVolunteer(volunteer.id, dbClient)
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
      await createTestVolunteer(volunteer.id, dbClient)
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
})
