-- https://www.postgresql.org/docs/current/sql-analyze.html
-- this should be run daily to make sure dead rows are cleared regularly,
-- even if an autovacuum hasn't run lately
vacuum analyze;
