// sync-masking-rules.ts
//
// Emits SQL (to stdout) that:
//   1. Reinstalls analytics._blanket_rules() with the body extracted from
//      database/privacy/01-blanket-labels.sql between the
//      -- BLANKET_QUERY_BEGIN / -- BLANKET_QUERY_END markers.
//   2. Upserts the set of (table_name, column_name, mask_value) tuples
//      extracted from database/privacy/02-custom-labels.sql via pgsql-parser
//      into analytics._custom_rules.
//   3. Calls analytics.rebuild().
//
// Everything is wrapped in a single transaction. The output is piped into
// psql by database/analytics/sync-masking-rules.sh.
//
// The two source files are also directly executable by staging via
// `psql -c "SET search_path = upchieve, public;" -f <file>` — this script
// is the analytics-only consumer.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'pgsql-parser'

const BLANKET_FILE = 'database/privacy/01-blanket-labels.sql'
const CUSTOM_FILE = 'database/privacy/02-custom-labels.sql'

// Walk the AST recursively and call visit() on every node. pgsql-parser AST
// nodes appear at varying depths and mix wrapper nodes (`{ SecLabelStmt: … }`),
// concrete bodies, and arrays, so visiting every node lets callers narrow with
// `'SomeStmt' in n`.
function walk(node: unknown, visit: (n: any) => void): void {
  if (!node || typeof node !== 'object') return
  visit(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, visit)
    } else if (typeof value === 'object') {
      walk(value, visit)
    }
  }
}

// The text of a pgsql-parser `String` node (v15 `sval` shape), or null.
function stringValue(stringNode: any): string | null {
  return typeof stringNode?.sval === 'string' ? stringNode.sval : null
}

// Read a SecLabelStmt's `object` field — a list of String nodes naming the
// labeled object. For a column label written as `ON COLUMN <table>.<column>`
// (2-part), we expect exactly two strings.
function columnRefFromSecLabel(
  secLabel: any
): { table: string; column: string } | null {
  if (!secLabel?.object) return null
  const parts: string[] = []
  walk(secLabel.object, (n) => {
    if (n.String) {
      const v = stringValue(n.String)
      if (v !== null) parts.push(v)
    }
  })
  if (parts.length !== 2) return null
  return { table: parts[0], column: parts[1] }
}

function extractBlanketQuery(src: string): string {
  const re = /--\s*BLANKET_QUERY_BEGIN\b([\s\S]*?)--\s*BLANKET_QUERY_END\b/
  const m = src.match(re)
  if (!m) {
    throw new Error(
      `${BLANKET_FILE}: missing BLANKET_QUERY_BEGIN / BLANKET_QUERY_END markers`
    )
  }
  return m[1].trim()
}

interface CustomRule {
  table: string
  column: string
  mask: string
}

async function extractCustomRules(src: string): Promise<CustomRule[]> {
  const { stmts = [] } = (await parse(src)) as { stmts?: any[] }
  const rules: CustomRule[] = []
  for (const raw of stmts) {
    let secLabel: any = null
    walk(raw, (n) => {
      if (n.SecLabelStmt) secLabel = n.SecLabelStmt
    })
    if (!secLabel) continue
    if (secLabel.provider && secLabel.provider !== 'anon') continue
    // Only column labels define custom column rules. A table/schema-level
    // label (objtype OBJECT_TABLE etc.) also carries an `object` list of
    // String nodes, so without this guard a 2-part name like
    // `ON TABLE upchieve.users` would be misread as table='upchieve',
    // column='users' and upserted as a bogus rule.
    if (secLabel.objtype !== 'OBJECT_COLUMN') continue
    // A label reset (`... IS NULL`) carries no `label` string. It's the
    // canonical way to clear an override (staging executes this file
    // directly); for the analytics sync, dropping it from the desired set is
    // enough — the UPSERT+DELETE below removes any stale _custom_rules row.
    if (typeof secLabel.label !== 'string') continue
    const ref = columnRefFromSecLabel(secLabel)
    if (!ref) {
      throw new Error(
        `${CUSTOM_FILE}: SECURITY LABEL statement is not in the supported ` +
          `2-part 'ON COLUMN <table>.<column>' form: ${JSON.stringify(secLabel)}`
      )
    }
    rules.push({ table: ref.table, column: ref.column, mask: secLabel.label })
  }
  return rules
}

// PostgreSQL literal quoting: single quote, double internal single quotes.
function pgLit(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

function emit(blanketBody: string, customs: CustomRule[]): string {
  const out: string[] = []
  out.push(`SET client_min_messages = WARNING;`)
  out.push(`BEGIN;`)
  out.push('')
  out.push(`-- 1. Reinstall analytics._blanket_rules() with file 1's body.`)
  out.push(`CREATE OR REPLACE FUNCTION analytics._blanket_rules ()`)
  out.push(`    RETURNS TABLE (`)
  out.push(`        table_name  text,`)
  out.push(`        column_name text,`)
  out.push(`        mask_value  text`)
  out.push(`    )`)
  out.push(`    LANGUAGE sql`)
  out.push(`    STABLE`)
  out.push(`AS $BLANKETFN$`)
  out.push(blanketBody)
  out.push(`$BLANKETFN$;`)
  out.push('')
  out.push(
    `-- 2. Replace analytics._custom_rules contents with file 2's parsed overrides.`
  )
  out.push(
    `CREATE TEMP TABLE _desired (` +
      `table_name text, column_name text, mask_value text, ` +
      `PRIMARY KEY (table_name, column_name)) ON COMMIT DROP;`
  )
  for (const r of customs) {
    out.push(
      `INSERT INTO _desired VALUES (${pgLit(r.table)}, ${pgLit(r.column)}, ${pgLit(r.mask)});`
    )
  }
  out.push(
    `INSERT INTO analytics._custom_rules (table_name, column_name, mask_value)
  SELECT table_name, column_name, mask_value FROM _desired
  ON CONFLICT (table_name, column_name) DO UPDATE
    SET mask_value = EXCLUDED.mask_value,
        updated_at = now();`
  )
  out.push(
    `DELETE FROM analytics._custom_rules
  WHERE (table_name, column_name) NOT IN (
    SELECT table_name, column_name FROM _desired
  );`
  )
  out.push('')
  out.push(`-- 3. Rebuild analytics views with the new blanket + overrides.`)
  out.push(`SELECT analytics.rebuild();`)
  out.push(`COMMIT;`)
  return out.join('\n') + '\n'
}

async function main(): Promise<void> {
  const root = process.env.SUBWAY_ROOT ?? process.cwd()
  const blanketSrc = readFileSync(resolve(root, BLANKET_FILE), 'utf8')
  const customSrc = readFileSync(resolve(root, CUSTOM_FILE), 'utf8')

  const blanketBody = extractBlanketQuery(blanketSrc)
  const customs = await extractCustomRules(customSrc)

  // Guard against the dollar-quote tag we use leaking through file 1.
  if (blanketBody.includes('$BLANKETFN$')) {
    throw new Error(
      `${BLANKET_FILE}: extracted body contains the reserved dollar-quote tag $BLANKETFN$. ` +
        `Rewrite the SELECT to not use that literal string.`
    )
  }

  process.stdout.write(emit(blanketBody, customs))
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`${msg}\n`)
  process.exit(1)
})
