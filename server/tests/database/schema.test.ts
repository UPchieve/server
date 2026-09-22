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

  describe('column comments', () => {
    test('every column in the upchieve schema has a comment starting with pii or not_pii', async () => {
      const result = await client.query(`
        SELECT c.relname AS table_name,
               a.attname AS column_name,
               col_description(c.oid, a.attnum) AS column_comment
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE n.nspname = 'upchieve'
          AND c.relkind IN ('r', 'p')
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND (
                col_description(c.oid, a.attnum) IS NULL
                OR col_description(c.oid, a.attnum) !~ '^(pii|not_pii)'
          )
        ORDER BY c.relname, a.attnum
      `)

      const columnsWithoutValidComment = result.rows.map(
        (r) => `${r.table_name}.${r.column_name}`
      )
      expect(columnsWithoutValidComment).toEqual([])
    })
  })
})
