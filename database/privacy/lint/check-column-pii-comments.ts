// database/privacy/lint/check-column-pii-comments.ts
//
// Diff-scoped lint: every column added to upchieve.* on this branch must
// carry a COMMENT ON COLUMN … IS 'pii' OR 'not_pii' inside the same
// migration. Any COMMENT ON COLUMN on upchieve.* with a different value
// also fails. Existing migrations on main are not re-validated — the
// pii/not_pii backfill is rolling out separately.
//
// Scope:
//   * pre-commit hook (CHECK_PII_BASE_REF unset): only what's *staged* —
//     exactly the migrations about to be committed (git diff --cached), read
//     from the index blob, not the working tree.
//   * CI (CHECK_PII_BASE_REF set to the MR target / default branch): every
//     migration *added* on this branch vs that ref (baseRef..HEAD).
// Files are resolved relative to the git work-tree root, not the shell's CWD.
//
// Exit codes:
//   0 — no diff, all good, or only warnings (e.g. an unparseable section)
//   1 — hard violations printed to stderr
//   2 — internal error
//
// Pure parse/validate functions live in ./check-column-pii-comments.lib.ts
// and are imported by unit tests directly.

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { checkMigration, Finding } from './check-column-pii-comments.lib'

// Resolve everything against the git work-tree root so the lint behaves the
// same regardless of the shell's CWD (npm script, pre-commit hook, or a
// developer invoking it from a subdirectory).
let cachedProjectRoot: string | null = null
function projectRoot(): string {
  if (cachedProjectRoot === null) {
    cachedProjectRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim()
  }
  return cachedProjectRoot
}

function diffMigrationFiles(baseRef: string | undefined): string[] {
  // Local pre-commit: only the staged delta vs HEAD — what's about to be
  // committed. CI: everything new on this branch vs the target ref. Two-dot
  // (baseRef..HEAD) compares the two commit trees directly, so it does not
  // depend on a merge-base being present in a shallow CI clone.
  const range = baseRef ? [`${baseRef}..HEAD`] : ['--cached']
  let out: string
  try {
    out = execFileSync(
      'git',
      [
        '-C',
        projectRoot(),
        'diff',
        '--name-only',
        // Only newly *added* migration files. Modifications to
        // migrations that already exist on the base ref are out of
        // scope — the pii/not_pii backfill is rolling out separately.
        '--diff-filter=A',
        ...range,
        '--',
        'database/migrations/',
      ],
      { encoding: 'utf8' }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    process.stderr.write(
      `error running git diff${baseRef ? ` against base '${baseRef}'` : ' --cached'}: ${msg}\n` +
        `hint: in CI, ensure CHECK_PII_BASE_REF points at a fetched ref.\n`
    )
    process.exit(2)
  }
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((p) => p.endsWith('.sql'))
}

/**
 * Read the exact bytes we're judging:
 *   * local (no baseRef): the *staged* blob (`git show :<path>`) — the content
 *     about to be committed, ignoring any unstaged working-tree edits.
 *   * CI (baseRef set): the checked-out file (working tree == HEAD).
 */
function readMigrationSource(
  relPath: string,
  baseRef: string | undefined
): string | null {
  if (!baseRef) {
    try {
      return execFileSync('git', ['-C', projectRoot(), 'show', `:${relPath}`], {
        encoding: 'utf8',
      })
    } catch {
      return null
    }
  }
  const abs = resolve(projectRoot(), relPath)
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null
}

async function main(): Promise<void> {
  const baseRef = process.env.CHECK_PII_BASE_REF
  const files = diffMigrationFiles(baseRef)

  if (files.length === 0) {
    return
  }

  const findings: Finding[] = []
  for (const relPath of files) {
    const sql = readMigrationSource(relPath, baseRef)
    if (sql === null) continue
    findings.push(...(await checkMigration(relPath, sql)))
  }

  // Warnings (e.g. an unparseable section) are surfaced but never fail the
  // lint — only hard violations set the non-zero exit code.
  for (const w of findings.filter((f) => f.kind === 'warning')) {
    process.stderr.write(`warning: ${w.file}: ${w.message}\n`)
  }

  const violations = findings.filter((f) => f.kind !== 'warning')
  if (violations.length === 0) {
    return
  }

  for (const v of violations) {
    process.stderr.write(`${v.file}: ${v.message}\n`)
  }
  process.stderr.write(
    `\n${violations.length} pii-comment violation(s). Each new upchieve.* column ` +
      `needs a COMMENT ON COLUMN with value 'pii' or 'not_pii'.\n`
  )
  process.exit(1)
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`internal error: ${msg}\n`)
  process.exit(2)
})
