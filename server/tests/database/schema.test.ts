/**
 * @group database/parallel
 */

import { getClient } from '../../db'

describe('schema', () => {
  const client = getClient()

  describe('primary keys', () => {
    test('every table in the upchieve schema has a primary key', async () => {
      const result = await client.query(`
        SELECT c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'upchieve'
          AND c.relkind IN ('r', 'p')
          AND NOT EXISTS (
                SELECT 1
                FROM pg_constraint pk
                WHERE pk.conrelid = c.oid
                  AND pk.contype = 'p'
          )
        ORDER BY c.relname
      `)

      const tablesWithoutPk = result.rows.map((r) => r.table_name)
      expect(tablesWithoutPk).toEqual([])
    })
  })
})
