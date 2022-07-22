import { getDbUlid, Pgid, Ulid } from '../models/pgUtils'
import { Pool } from 'pg'
import _ from 'lodash'

async function getSubjectIdByName(name: string, client: Pool): Promise<Pgid> {
  const result = await client.query('SELECT id FROM subjects WHERE name = $1', [
    name,
  ])
  if (result.rows.length && result.rows[0]) return result.rows[0].id
  throw new Error(`Subject ${name} not found`)
}

type SessionRow = any
export async function buildSession(
  overrides: Partial<SessionRow> & { studentId: Ulid },
  client?: Pool
): Promise<SessionRow> {
  return {
    id: getDbUlid(),
    subjectId: client ? await getSubjectIdByName('algebraOne', client) : 1,
    hasWhiteboardDoc: true,
    reviewed: false,
    toReview: false,
    timeTutored: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
