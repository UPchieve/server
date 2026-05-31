import { checkMigration, splitSections } from '../check-column-pii-comments.lib'

// checkMigration parses a dbmate migration (its `-- migrate:up` / `-- migrate:down`
// sections independently) and returns a Violation[]; empty means the migration
// satisfies the pii/not_pii rule. `filePath` only labels the messages, so we
// pass a fixed stub. No git, no database — this is pure parse-and-validate.
const FILE = 'database/migrations/00000000000000_test.sql'
const run = (sql: string) => checkMigration(FILE, sql)

describe('check-column-pii-comments', () => {
  describe('passing migrations (no violations)', () => {
    it('ADD COLUMN with a not_pii comment in the same section', async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN nickname text;
COMMENT ON COLUMN upchieve.users.nickname IS 'not_pii';
-- migrate:down
ALTER TABLE upchieve.users DROP COLUMN nickname;
`
      expect(await run(sql)).toEqual([])
    })

    it("accepts 'pii' as well as 'not_pii'", async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN ssn text;
COMMENT ON COLUMN upchieve.users.ssn IS 'pii';
`
      expect(await run(sql)).toEqual([])
    })

    it('CREATE TABLE with every column commented', async () => {
      const sql = `
-- migrate:up
CREATE TABLE upchieve.widgets (id serial PRIMARY KEY, owner_email text);
COMMENT ON COLUMN upchieve.widgets.id IS 'not_pii';
COMMENT ON COLUMN upchieve.widgets.owner_email IS 'pii';
-- migrate:down
DROP TABLE upchieve.widgets;
`
      expect(await run(sql)).toEqual([])
    })

    it('ignores columns added to non-upchieve schemas', async () => {
      const sql = `
-- migrate:up
ALTER TABLE public.audit_log ADD COLUMN note text;
`
      expect(await run(sql)).toEqual([])
    })

    it('ignores unqualified DDL (defaults to public, not upchieve)', async () => {
      const sql = `
-- migrate:up
ALTER TABLE audit_log ADD COLUMN note text;
`
      expect(await run(sql)).toEqual([])
    })

    it('treats an empty migrate:down section as a no-op', async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN nickname text;
COMMENT ON COLUMN upchieve.users.nickname IS 'not_pii';
-- migrate:down
`
      expect(await run(sql)).toEqual([])
    })

    it('up drops a column and down re-adds it WITH a comment', async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users DROP COLUMN legacy;
-- migrate:down
ALTER TABLE upchieve.users ADD COLUMN legacy text;
COMMENT ON COLUMN upchieve.users.legacy IS 'not_pii';
`
      expect(await run(sql)).toEqual([])
    })
  })

  describe('failing migrations (violations)', () => {
    it('flags an ADD COLUMN with no comment', async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN nickname text;
`
      const v = await run(sql)
      expect(v).toHaveLength(1)
      expect(v[0].message).toContain('upchieve.users.nickname')
      expect(v[0].message).toMatch(/without a/)
    })

    it("rejects a comment value that isn't pii/not_pii", async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN nickname text;
COMMENT ON COLUMN upchieve.users.nickname IS 'sensitive';
`
      const v = await run(sql)
      expect(v).toHaveLength(1)
      expect(v[0].message).toContain("must be exactly 'pii' or 'not_pii'")
    })

    it('flags a CREATE TABLE column left uncommented', async () => {
      const sql = `
-- migrate:up
CREATE TABLE upchieve.widgets (id serial PRIMARY KEY, owner_email text);
COMMENT ON COLUMN upchieve.widgets.id IS 'not_pii';
-- migrate:down
DROP TABLE upchieve.widgets;
`
      const v = await run(sql)
      expect(v).toHaveLength(1)
      expect(v[0].message).toContain('upchieve.widgets.owner_email')
    })

    it('flags a down-section re-add with no comment (per-section rule)', async () => {
      // Postgres drops a column's comment when the column is dropped, so a
      // reversible drop must re-classify the column in the down block too.
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users DROP COLUMN legacy;
-- migrate:down
ALTER TABLE upchieve.users ADD COLUMN legacy text;
`
      const v = await run(sql)
      expect(v).toHaveLength(1)
      expect(v[0].message).toMatch(/migrate:down/)
      expect(v[0].message).toContain('upchieve.users.legacy')
    })

    it('reports a violation per uncommented column across both sections', async () => {
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN a text;
-- migrate:down
ALTER TABLE upchieve.users ADD COLUMN b text;
`
      expect(await run(sql)).toHaveLength(2)
    })

    it('flags unqualified DDL once search_path is redirected to upchieve', async () => {
      // The schema prefix can't be dropped to bypass the guard.
      const sql = `
-- migrate:up
SET search_path TO upchieve;
ALTER TABLE users ADD COLUMN ssn text;
`
      const v = await run(sql)
      expect(v).toHaveLength(1)
      expect(v[0].message).toContain('upchieve.users.ssn')
    })
  })

  describe('unparseable sections (non-fatal warnings)', () => {
    it('warns but does not hard-fail when a section cannot be parsed', async () => {
      // `DROP COLUMN IF NOT EXISTS` is invalid SQL the parser rejects; the lint
      // surfaces a warning rather than blocking the migration.
      const sql = `
-- migrate:up
ALTER TABLE upchieve.users ADD COLUMN ok text;
COMMENT ON COLUMN upchieve.users.ok IS 'not_pii';
-- migrate:down
ALTER TABLE upchieve.users DROP COLUMN IF NOT EXISTS ok;
`
      const findings = await run(sql)
      expect(findings.every((f) => f.kind === 'warning')).toBe(true)
      expect(findings).toHaveLength(1)
      expect(findings[0].message).toMatch(/could not parse migrate:down/)
    })
  })

  describe('splitSections', () => {
    it('splits up/down and treats an unmarked file as one section', () => {
      const withMarkers = splitSections(
        '-- migrate:up\nSELECT 1;\n-- migrate:down\nSELECT 2;'
      )
      expect(withMarkers.map((s) => s.name)).toEqual(['up', 'down'])

      const noMarkers = splitSections('SELECT 1;')
      expect(noMarkers).toHaveLength(1)
      expect(noMarkers[0].name).toBe('file')
    })
  })
})
