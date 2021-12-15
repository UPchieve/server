import { Ulid } from 'id128'
import pool from '../pg-pool'
import * as db from 'zapatos/db'
// TODO: upgrade pretteir to >=2.0.1 to allow for this syntax
// import type * as schema from 'zapatos/schema'
import * as schema from 'zapatos/schema'

export function getDbUlid() {
  return Ulid.generate().toRaw()
}

type NumberOrString<T> = T extends string
  ? string
  : T extends number
  ? number
  : never

type WhereableOptions<T> =
  | T
  | db.Parameter<T>
  | db.SQLFragment
  | db.ParentColumn
  | db.SQLFragment<any, T | db.Parameter<T> | db.SQLFragment | db.ParentColumn>

type WhereNameForTable<Table extends schema.Table> = schema.WhereableForTable<
  Table
> extends { name?: any }
  ? schema.WhereableForTable<Table>['name']
  : never
type WhereableByName<Table extends schema.Table> = WhereableOptions<
  string
> extends WhereNameForTable<Table>
  ? Table
  : never

type SelectRowForTable<
  Table extends schema.Table
> = schema.JSONSelectableForTable<Table> extends { id: any }
  ? schema.JSONSelectableForTable<Table>
  : never
type SelectIdForTable<
  Table extends schema.Table
> = schema.JSONSelectableForTable<Table> extends { id: any }
  ? schema.JSONSelectableForTable<Table>['id']
  : never
type SelectableById<Table extends schema.Table> = NumberOrString<
  SelectIdForTable<Table>
> extends never
  ? never
  : Table

/*
type test = 'student_profiles'  // pick a table
type nameTest = WhereableByName<test> = table if row.name exists and is a string
type selectTest = SelectableById<test> = table if row.id exists and is string or number
*/

/**
 * Queries provided table for a single row with row.name equal to provided value
 * If no row or multiple rows match it will throw a pg error
 * If the provided table does not have a wherable name property or selectable
 * id property you will recieve a type error 'string' is not assignable to 'never'
 * @param table table name string
 * @param name name to query for
 * @returns id of row
 */
export async function getIdByName<Table extends schema.Table>(
  table: SelectableById<WhereableByName<Table>>,
  name: string
): Promise<NumberOrString<SelectIdForTable<Table>> | undefined> {
  if (table) {
    const where = { name } as schema.WhereableForTable<Table>
    const obj = await db.selectExactlyOne(table, where).run(pool)
    return (obj as SelectRowForTable<Table>).id
  }
}

export async function getIdByNameFailsafe<Table extends schema.Table>(
  table: SelectableById<WhereableByName<Table>>,
  name: string
): Promise<NumberOrString<SelectIdForTable<Table>>> {
  const value = await getIdByName(table, name)
  if (!value)
    throw new Error(`Table ${table} contains no row with name ${name}`)
  return value
}
