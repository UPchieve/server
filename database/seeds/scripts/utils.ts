import { Ulid } from 'id128'
import pool from '../pg-pool'
import * as db from 'zapatos/db'
// TODO: upgrade pretteir to >=2.0.1 to allow for this syntax
// import type * as schema from 'zapatos/schema'
import * as schema from 'zapatos/schema'

export function getDbUlid() {
  return Ulid.generate().toRaw()
}

type ExtractColumns<T extends schema.Table> = keyof schema.WhereableForTable<T>
type WhereableByName<
  Table extends schema.Table,
  Columns extends ExtractColumns<Table>
> = Columns extends 'name' ? Table : never
type ExtractSelectable<
  T extends schema.Table
> = keyof schema.SelectableForTable<T>
type SelectableById<
  Table extends schema.Table,
  Columns extends ExtractSelectable<Table>
> = Columns extends 'id' ? Table : never
type ExtractJSONSelectable<
  T extends schema.Table
> = keyof schema.JSONSelectableForTable<T>
type JSONSelectableById<
  Table extends schema.Table,
  Columns extends ExtractJSONSelectable<Table>
> = Columns extends 'id' ? Table : never

export async function getIdByName<Table extends schema.Table>(
  table: JSONSelectableById<
    SelectableById<
      WhereableByName<Table, ExtractColumns<Table>>,
      ExtractSelectable<Table>
    >,
    ExtractJSONSelectable<Table>
  >,
  name: string
): Promise<number | undefined> {
  if (table) {
    const where = { name } as schema.WhereableForTable<Table>
    const obj = await db.selectExactlyOne(table, where).run(pool)
    return (obj as schema.JSONSelectableForTable<Table> & { id: number }).id
  }
}

export async function getIdByNameFailsafe<Table extends schema.Table>(
  table: JSONSelectableById<
    SelectableById<
      WhereableByName<Table, ExtractColumns<Table>>,
      ExtractSelectable<Table>
    >,
    ExtractJSONSelectable<Table>
  >,
  name: string
): Promise<number> {
  const value = await getIdByName(table, name)
  if (!value)
    throw new Error(`Table ${table} contains no row with name ${name}`)
  return value
}
