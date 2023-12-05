import fs from 'fs'
import * as db from '../db'

const REMOVED_COL_ERR = 'cannot drop columns from view'

export default async function updateBasicAccessViews() {
  try {
    const tables = JSON.parse(
      fs.readFileSync(
        `${__dirname}/../../database/db_init/upchieve_basic_access.json`,
        { encoding: 'utf-8' }
      )
    )

    await db.connect()

    const dropFirst = []
    for (const table in tables) {
      try {
        await db.getClient().query(getCreateQuery(table, tables[table]))
      } catch (err) {
        if ((err as { message: string }).message === REMOVED_COL_ERR) {
          dropFirst.push(table)
        }
      }
    }

    for (const table of dropFirst) {
      await db.getClient().query(getDropQuery(table))
      await db.getClient().query(getCreateQuery(table, tables[table]))
    }
  } catch (err) {
    throw new Error(`error updating basic access views: ${err}`)
  } finally {
    await db.closeClient()
  }
}

function getCreateQuery(table: string, cols: string[]) {
  return `CREATE OR REPLACE VIEW basic_access.${table} AS SELECT ${cols.join(
    ', '
  )} FROM ${table};`
}

function getDropQuery(table: string) {
  return `DROP VIEW basic_access.${table};`
}
