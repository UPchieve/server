import { Pool } from 'pg'
import { Pgid } from '../models/pgUtils'
import _ from 'lodash'
import { CamelCasedProperties } from 'type-fest'

export async function getSubjectIdByName(
  name: string,
  client: Pool
): Promise<Pgid> {
  const result = await client.query('SELECT id FROM subjects WHERE name = $1', [
    name,
  ])
  if (result.rows.length && result.rows[0]) return result.rows[0].id
  throw new Error(`Subject ${name} not found`)
}

/**
 * The following functions are VERY DANGEROUS and their patterns should not be used
 * anywhere else in the ap outside testing. We need to convert incoming camelCase
 * javascript object keys into  snake_case and back.
 *
 * We provide quick and dirty utility functions for inserting a single row,
 * dropping tables, and making a simple SELECT query for the purposes of writing
 * database query tests ONLY. Check out tests/database/AssistmentsData.test.ts
 * for exmaples of how to use these functions
 */

export function camelCaseKeys<T extends { [k: string]: any }>(
  obj: T
): CamelCasedProperties<T> {
  let newObj: any = {}
  for (const key in obj) {
    const newKey = _.camelCase(key)
    newObj[newKey] = obj[key]
  }
  return newObj as CamelCasedProperties<T>
}

export async function insertSingleRow<T extends { [key: string]: any }>(
  table: string,
  object: T,
  client: Pool
): Promise<CamelCasedProperties<T>> {
  const entries = Object.entries(object)
  let keyString = ''
  let valueString = ''
  const values: string[] = []
  for (let i = 0; i < entries.length; i++) {
    keyString += `${_.snakeCase(entries[i][0])}`
    valueString += `$${i + 1}`
    if (i !== entries.length - 1) {
      keyString += ', '
      valueString += ', '
    }
    values.push(entries[i][1])
  }
  const query = `INSERT INTO ${table} (${keyString}) VALUES (${valueString}) RETURNING ${keyString};`
  const result = await client.query(query, values)
  if (result.rows[0]) return camelCaseKeys(result.rows[0])
  throw new Error(`Inserting into ${table} failed`)
}

export async function dropTables(
  tables: string[],
  client: Pool
): Promise<void> {
  let deleteString = ''
  for (const table of tables) {
    deleteString += `DELETE FROM ${table} CASCADE;\n`
  }
  await client.query(deleteString)
}

export async function executeQuery(
  queryString: string,
  params: string[],
  client: Pool
) {
  const result = await client.query(queryString, params)
  const rows = []
  for (const row of result.rows) {
    rows.push(camelCaseKeys(row))
  }
  return { rows }
}
