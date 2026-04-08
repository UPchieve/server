# 🗄️ Database Refresh from Production

This repo includes a script to safely refresh **reference data** from production into a local or development database.

It is designed to:

- keep dev environments up-to-date with real data
- preserve user state (sessions, progress, etc.)
- avoid foreign key and identity issues

---

## ⚠️ IMPORTANT

🚨 **DO NOT RUN THIS SCRIPT AGAINST PRODUCTION**

This script modifies data and will overwrite reference tables.

It is intended for:

- local development
- staging/dev environments only

---

## 🔁 What Gets Updated

### ✅ Refreshed from production

- subjects
- certifications
- quizzes (and related tables)
- schools
- cities

### 🛑 Preserved

- sessions
- user certifications
- user quiz progress
- student profiles

---

## 🧠 How It Works

1. Dump reference data from production
2. Rewrite SQL into a temporary schema (`import_upchieve`)
3. Load into local DB
4. Backup user-related tables
5. Refresh reference tables
6. Remap relationships (by name, not ID)
7. Restore user data
8. Validate integrity
9. Clean up temporary schemas

---

## 🛑 Safety Features

- Script stops on any SQL error
- Uses `ON_ERROR_STOP=1`
- Uses `set -euo pipefail`
- Supports `--dry-run`

---

## ⚠️ Gotchas

### Do NOT run on production

This will overwrite reference tables.

### Dumps are reused daily

If data looks stale:

```bash
rm data/prod_dump_*.sql
```

### IDs are different across environments

We do not rely on IDs.

Mapping is done using:

- `name`
- `mongo_id` (schools)

### Script fails fast on errors

Fix the error and rerun.

---

## ❌ What NOT To Do

- Do not run this against production
- Do not commit files from `data/`
- Do not manually edit dump files
- Do not skip validation
- Do not rely on IDs being consistent

---

## 📦 Scripts

Located in:

```text
scripts/db-refresh/
```

### Core Scripts

- **run_refresh_from_prod.sh**  
  Main entry point. Orchestrates the full refresh process.

- **get_prod_data.sh**  
  Pulls reference data from production using `pg_dump`.

- **rewrite_prod_dump.sh**  
  Rewrites SQL to use the `import_upchieve` schema (safe transformation).

- **load_import_dump.sh**  
  Loads rewritten SQL into the target database.

---

### SQL Steps

- **00_prepare_import_schema.sql**  
  Creates temporary schemas (`import_upchieve`, `backup_upchieve`).

- **01_backup_preserved_tables.sql**  
  Backs up user-related tables before refresh.

- **02_refresh_core_data.sql**  
  Core refresh logic: updates reference tables and remaps relationships.

- **03_validate_refresh.sql**  
  Runs integrity checks after refresh.

- **04_cleanup_refresh_artifacts.sql**  
  Drops temporary schemas.

---

## 🚀 Quick Start

```bash
export PGPASSWORD=Password123

./scripts/db-refresh/run_refresh_from_prod.sh \
  "postgres://<prod_user>@<prod_host>:5432/<prod_db>"
```

---

## 🧪 Dry Run (Recommended First)

Preview all steps without modifying your database:

```bash
./scripts/db-refresh/run_refresh_from_prod.sh --dry-run "prod_url"
```

---

## 🎯 Target Database

If no target DB is provided, the script defaults to:

```
postgres://admin@localhost:5432/upchieve
```

Override it:

```bash
./scripts/db-refresh/run_refresh_from_prod.sh "prod_url" "target_url"
```

---

## 🔐 Password Handling

Passwords are not stored in this repo.

Set your DB password using:

```bash
export PGPASSWORD=Password123
```

---

## 📁 Data Files

Dump files are stored in:

```
data/
```

Examples:

```
data/prod_dump_08-04-2026.sql
data/prod_dump_08-04-2026_rewritten.sql
```

### Behavior

- Files are reused for the same day
- They are ignored by git (`.gitignore`)
- To force a fresh pull:

```bash
rm data/prod_dump_*.sql
```

---

## 🎉 Summary

This provides a safe, repeatable, one-command workflow to refresh dev/staging databases while preserving user state and avoiding schema conflicts.
