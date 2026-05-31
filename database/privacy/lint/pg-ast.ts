// Reading a libpg_query parse tree (as produced by pgsql-parser). Nothing here
// knows about pii, upchieve, or migrations: given a fragment of SQL, `scanSql`
// returns a neutral structural summary, so the lint's policy never touches the
// AST. Everything else in this file is private to that one capability.

import { parse } from 'pgsql-parser'
import type { Node, RangeVar, String as PgString } from '@pgsql/types'

/**
 * Depth-first visit of every object in a parse tree. The tree mixes wrapper
 * nodes (`{ CreateStmt: {...} }`), concrete bodies (`RangeVar`, …) and arrays,
 * so each visited object is handed back as a loosely-typed `Node` for the
 * caller to narrow with `'SomeStmt' in n`. The tree is never mutated.
 */
function walk(node: unknown, visit: (n: Node) => void): void {
  if (!node || typeof node !== 'object') return
  visit(node as Node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, visit)
    } else if (value && typeof value === 'object') {
      walk(value, visit)
    }
  }
}

/** The text of a libpg_query `String` node, or null. */
function stringValue(node: PgString | undefined): string | null {
  return typeof node?.sval === 'string' ? node.sval : null
}

/** Schema and table of a relation; either is null when absent (unqualified). */
function pickRelation(rel: RangeVar | undefined): {
  schema: string | null
  table: string | null
} {
  return { schema: rel?.schemaname ?? null, table: rel?.relname ?? null }
}

/** The column name of a `ColumnDef` wrapper node, if that's what it is. */
function columnDefName(node: Node | undefined): string | undefined {
  return node && 'ColumnDef' in node ? node.ColumnDef.colname : undefined
}

/**
 * Columns a single DDL statement adds and the table it targets — covers
 * CREATE TABLE and ALTER TABLE … ADD COLUMN. null for any other statement.
 */
function addedColumns(n: Node): {
  schema: string | null
  table: string | null
  columns: string[]
} | null {
  if ('CreateStmt' in n) {
    const columns = (n.CreateStmt.tableElts ?? [])
      .map(columnDefName)
      .filter((c): c is string => typeof c === 'string')
    return { ...pickRelation(n.CreateStmt.relation), columns }
  }
  if ('AlterTableStmt' in n) {
    const columns = (n.AlterTableStmt.cmds ?? [])
      .map((cmd) => ('AlterTableCmd' in cmd ? cmd.AlterTableCmd : undefined))
      .filter((cmd) => cmd?.subtype === 'AT_AddColumn')
      .map((cmd) => columnDefName(cmd?.def))
      .filter((c): c is string => typeof c === 'string')
    return { ...pickRelation(n.AlterTableStmt.relation), columns }
  }
  return null
}

/**
 * A `COMMENT ON COLUMN <schema?>.<table>.<column> IS '<value>'` decomposed into
 * its parts. null for any other statement, or a column comment that isn't at
 * least table-qualified.
 */
function columnComment(n: Node): {
  schema: string | null
  table: string
  column: string
  value: string
} | null {
  if (!('CommentStmt' in n) || n.CommentStmt.objtype !== 'OBJECT_COLUMN') {
    return null
  }
  const parts: string[] = []
  walk(n.CommentStmt.object, (m) => {
    if ('String' in m) {
      const v = stringValue(m.String)
      if (v !== null) parts.push(v)
    }
  })
  if (parts.length < 2) return null
  const tail = parts.slice(-3)
  const schema = tail.length >= 3 ? tail[0] : null
  const [table, column] = tail.slice(-2)
  return { schema, table, column, value: n.CommentStmt.comment ?? '' }
}

/** The schemas a `SET search_path` statement targets; null for any other. */
function searchPathTargets(n: Node): string[] | null {
  if (!('VariableSetStmt' in n) || n.VariableSetStmt.name !== 'search_path') {
    return null
  }
  const schemas: string[] = []
  walk(n.VariableSetStmt.args, (a) => {
    // args carry A_Const { sval: '<schema>' }.
    if ('A_Const' in a) {
      const v = stringValue(a.A_Const.sval)
      if (v !== null) schemas.push(v)
    }
  })
  return schemas
}

/**
 * True when SQL contains anything other than whitespace and comments. The
 * parser rejects an empty query, so an empty/comment-only fragment is scanned
 * as a no-op rather than reported as a parse error.
 */
function hasStatements(sql: string): boolean {
  const withoutComments = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
  return withoutComments.trim().length > 0
}

/** A neutral structural summary of a SQL fragment's DDL — no schema policy. */
export interface SqlScan {
  /** Columns added, with the table they target (`schema` null if unqualified). */
  addedColumns: Array<{ schema: string | null; table: string; column: string }>
  /** COMMENT ON COLUMN statements, decomposed. */
  columnComments: Array<{
    schema: string | null
    table: string
    column: string
    value: string
  }>
  /** Schemas named by any `SET search_path` in the fragment. */
  searchPathSchemas: string[]
}

/**
 * Parse a SQL fragment and summarize the structural DDL it performs. Empty or
 * comment-only SQL yields an empty scan; unparseable SQL yields its error.
 */
export async function scanSql(
  sql: string
): Promise<{ scan: SqlScan } | { parseError: string }> {
  const scan: SqlScan = {
    addedColumns: [],
    columnComments: [],
    searchPathSchemas: [],
  }
  if (!hasStatements(sql)) return { scan }

  let stmts: Node[]
  try {
    const result = (await parse(sql)) as { stmts?: Node[] }
    stmts = result?.stmts ?? []
  } catch (err) {
    return { parseError: err instanceof Error ? err.message : String(err) }
  }

  for (const raw of stmts) {
    walk(raw, (n) => {
      const added = addedColumns(n)
      if (added && added.table) {
        for (const column of added.columns) {
          scan.addedColumns.push({
            schema: added.schema,
            table: added.table,
            column,
          })
        }
      }
      const comment = columnComment(n)
      if (comment) scan.columnComments.push(comment)
      const paths = searchPathTargets(n)
      if (paths) scan.searchPathSchemas.push(...paths)
    })
  }
  return { scan }
}
