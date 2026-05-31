import { scanSql } from './pg-ast'
import type { SqlScan } from './pg-ast'

const ALLOWED_VALUES = new Set(['pii', 'not_pii'])

export interface Finding {
  file: string
  message: string
  /**
   * `warning` findings (e.g. a section the parser couldn't read) are printed
   * but do NOT fail the lint: this lint classifies PII, it does not validate
   * SQL, and genuinely invalid SQL is caught when dbmate runs the migration.
   * Omitted means a hard violation.
   */
  kind?: 'violation' | 'warning'
}

/**
 * dbmate migrations carry both a `-- migrate:up` and a `-- migrate:down`
 * section in one file. We lint each section independently: a column added in
 * a section must be commented within that same section. This matters because
 * Postgres drops a column's comment when the column is dropped, so a
 * reversible drop (up drops, down re-adds) gets a brand-new, uncommented
 * column on rollback — the down block must re-classify it.
 */
export function splitSections(
  sql: string
): Array<{ name: string; sql: string }> {
  const lines = sql.split('\n')
  const sections: Array<{ name: string; sql: string }> = []
  let current: { name: string; start: number } | null = null
  const flush = (end: number) => {
    if (current) {
      sections.push({
        name: current.name,
        sql: lines.slice(current.start, end).join('\n'),
      })
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const m = /^--\s*migrate:(up|down)\b/i.exec(lines[i].trim())
    if (m) {
      flush(i)
      current = { name: m[1].toLowerCase(), start: i + 1 }
    }
  }
  flush(lines.length)
  // No markers found: lint the whole file as a single section.
  return sections.length > 0 ? sections : [{ name: 'file', sql }]
}

/** Validate one migration by checking each of its sections independently. */
export async function checkMigration(
  filePath: string,
  sql: string
): Promise<Finding[]> {
  const findings: Finding[] = []
  for (const section of splitSections(sql)) {
    findings.push(...(await checkSection(filePath, section.name, section.sql)))
  }
  return findings
}

// --- scope: narrow a neutral SQL scan to what lands in upchieve.* -----------

interface AddedColumn {
  schema: string | null
  table: string
  column: string
}
interface ColumnComment {
  table: string
  column: string
  value: string
}
interface SectionFacts {
  addedColumns: AddedColumn[]
  columnComments: ColumnComment[]
  redirectsSearchPathToUpchieve: boolean
}

/**
 * upchieve.* is always in scope; unqualified DDL (null schema) is a candidate
 * resolved against search_path. Explicit non-upchieve schemas are out of scope.
 */
function inScopeSchema(schema: string | null): boolean {
  return schema === 'upchieve' || schema === null
}

/** Keep only the scan entries that target the upchieve schema. */
function inScopeFacts(scan: SqlScan): SectionFacts {
  return {
    addedColumns: scan.addedColumns.filter((c) => inScopeSchema(c.schema)),
    columnComments: scan.columnComments
      .filter((c) => inScopeSchema(c.schema))
      .map(({ table, column, value }) => ({ table, column, value })),
    redirectsSearchPathToUpchieve: scan.searchPathSchemas.includes('upchieve'),
  }
}

// --- policy -----------------------------------------------------------------

/** Apply the pii policy to one section's facts. */
function applyPolicy(
  filePath: string,
  section: string,
  facts: SectionFacts
): Finding[] {
  const findings: Finding[] = []
  const commented = new Set(
    facts.columnComments.map((c) => `${c.table}.${c.column}`)
  )

  // Every column comment on an in-scope column must use an allowed value.
  for (const c of facts.columnComments) {
    if (!ALLOWED_VALUES.has(c.value)) {
      findings.push({
        file: filePath,
        message:
          `COMMENT ON COLUMN upchieve.${c.table}.${c.column} IS '${c.value}' — ` +
          `must be exactly 'pii' or 'not_pii'.`,
      })
    }
  }

  // Every added column needs a comment in the same section. Unqualified DDL
  // counts only when search_path was redirected to upchieve — dbmate connects
  // with the default search_path, so unqualified DDL otherwise lands in
  // public.* (out of scope); honoring it here stops the schema prefix from
  // being dropped to bypass the guard.
  for (const col of facts.addedColumns) {
    if (col.schema === null && !facts.redirectsSearchPathToUpchieve) continue
    if (!commented.has(`${col.table}.${col.column}`)) {
      findings.push({
        file: filePath,
        message:
          `column upchieve.${col.table}.${col.column} added in migrate:${section} without a ` +
          `COMMENT ON COLUMN … IS 'pii' (or 'not_pii') in the same section.`,
      })
    }
  }

  return findings
}

/**
 * Lint one migration section: scan its SQL, narrow to upchieve, apply the
 * policy. A section the parser can't read becomes a non-fatal warning (see
 * Finding.kind) rather than a hard failure — blocking valid migrations on a
 * parser limitation is worse than missing one, and dbmate still rejects truly
 * invalid SQL on run.
 */
export async function checkSection(
  filePath: string,
  section: string,
  sql: string
): Promise<Finding[]> {
  const result = await scanSql(sql)
  if ('parseError' in result) {
    return [
      {
        file: filePath,
        kind: 'warning',
        message: `could not parse migrate:${section}; skipped (${result.parseError})`,
      },
    ]
  }

  return applyPolicy(filePath, section, inScopeFacts(result.scan))
}
