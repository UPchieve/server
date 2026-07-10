# Logical Replication

## Setup

### Publication

As of writing, our Postgres database is hosted on Aiven. Aiven doesn't actually give us access to a superuser, which is required to setup logical replication. Instead, Aiven gives us access to this functionality through their [`aiven_extras`](https://github.com/aiven/aiven-extras) extension. Unfortunately, there are just two functions provided to create publication - one that publishes _all_ tables from _all_ schemas, and one where you have to list every single table to publish[1]. We don't want the former, because that would include tables in `public` (conflict for `migrations` table) and `auth` (not something we want at all); the latter sucks because we have _a lot_ of tables AND we have to reregister every time a new table is added.

In `publication.sql`, the fancy `SELECT` just constructs a list all of the tables in `upchieve`. Whenever we run a migration, we will have to alter the publication in order to pick up any newly added table.

[1] I have created a support ticket asking for a function that wraps `CREATE PUBLICATION <name> FOR TABLES IN SCHEMA <schema>`.

With all that said, to setup the publication, complete the following:
1. `cd` into this directory:
```bash
cd subway/database/privacy/replication/setup
```
2. Double check the `publication.sql` file looks sane.
3. Connect to the **primary** upchieve database as `avnadmin` with the following command:.
Note: Replace `<item>` with the name of the item in 1Password (e.g. `dev_postgres`, `staging_postgres`):
```bash
# DO NOT directly add password in the command below since the password will be added IN PLAINTEXT to your .bash_history.
PGPASSWORD=$(op read op://engineering/<item>/admin/password) \
psql --host $(op read op://engineering/<item>/server) \
  --port $(op read op://engineering/<item>/port) \
  --username avnadmin \
  --dbname upchieve
```
4. In `psql`, run the following to create the publication:
```sql
\i publication.sql
```
5. While still in `psql`, verify creation of the publication:
```sql
-- To see the publication:
SELECT * FROM pg_publication;
-- To see all the tables that will be published (will include _every_ table in upchieve schema):
SELECT * FROM pg_publication_tables;
```

## Maintenance
The following scripts are executed automatically in our [migration script](https://gitlab.com/upchieve/grand-central-station/-/blob/main/marathon/ansible/roles/database/maintenance_scripts/templates/migrate_production.sh), **in the proper order**. You should not need to run these manually, but if you do, make sure to run in the following order:

1. dbmate on subscriber
2. dbmate on publisher
3. alter-publication
4. refresh-subscription

Note, however, that this order is built for _adding_ tables. When a migration _drops_ a table, dropping it on the subscriber (step 1) before the publisher (step 2) leaves a time where the publisher still publishes the table but the subscriber no longer has it. If, in that time, there is any change to the dropped table, the subscriber receives a change for a table it no longer has, gets stuck at that LSN, and the stream will NOT self-heal. This order is only safe for dropping a table because we stop writing to a table (in code) before dropping it. If that ever isn't true, **migrate the publisher before the subscriber**.

### alter-publication
As noted above in the [Publication](#publication) setup section, whenever we add a new table to the `upchieve` schema, we will need to alter the publication so that the new table's changes are included in the replication stream.

Instead of having to manually enter the new table name, we can simply find all the tables in the `upchieve` schema that we _aren't_ already publishing, and add them to the publication.

Note that running this script on the publisher alone will not replicate data - we _also_ need to refresh the subscription, see [refresh-subscription](#refresh-subscription).

### refresh-subscription
TODO
