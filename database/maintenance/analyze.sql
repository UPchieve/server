-- https://www.postgresql.org/docs/current/sql-analyze.html
-- this should be run daily to make sure statistics are up to date,
-- even if an autovacuum hasn't run lately
analyze;
