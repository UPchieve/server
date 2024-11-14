import { buildSessionRow } from '../mocks/generate'
import { getClient } from '../../db'
import { getSessionHistory, getTotalSessionHistory } from '../../models/Session'
import { insertSingleRow } from '../db-utils'
import { range } from 'lodash'
import moment from 'moment'

describe('Session repo', () => {
  const dbClient = getClient()
  const studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  const volunteerId = '01919662-8804-8772-ecf7-b08dfa28c6e4'

  describe('Session history', () => {
    describe('getTotalSessionHistory', () => {
      it('Reports the correct number of total sessions for the user', async () => {
        const timeTutored = 100000
        const endedAt = new Date()
        const createdAt = moment()
          .subtract(1, 'hours')
          .toDate()
        for (const i in range(0, 5)) {
          const sessionRow = await buildSessionRow({
            studentId,
            volunteerId,
            timeTutored,
            createdAt,
            endedAt,
          })
          await insertSingleRow('sessions', sessionRow, dbClient)
        }

        const total = await getTotalSessionHistory(studentId)
        expect(total).toEqual(5)

        const firstPage = await getSessionHistory(studentId, 4, 0)
        const secondPage = await getSessionHistory(studentId, 4, 4)
        expect(firstPage.length).toEqual(4)
        expect(secondPage.length).toEqual(1)
      })
    })
  })
})
