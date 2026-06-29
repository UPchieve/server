-- migrate:up
CREATE VIEW upchieve.table_descriptions AS
SELECT
    pg_class.relname AS table_name,
    pg_description.description
FROM
    pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    JOIN pg_description ON pg_description.objoid = pg_class.oid
        AND pg_description.objsubid = 0
WHERE
    pg_namespace.nspname = 'upchieve'
    AND pg_class.relkind = 'r';

CREATE VIEW upchieve.column_descriptions AS
SELECT
    c.table_name,
    c.column_name,
    (pg_description.description LIKE 'pii%') AS is_pii,
    CASE WHEN pg_description.description LIKE '%: %' THEN
        substring(pg_description.description FROM position(': ' IN pg_description.description) + 2)
    ELSE
        ''
    END AS description
FROM
    information_schema.columns c
    JOIN pg_class ON pg_class.relname = c.table_name
    JOIN pg_namespace ON pg_namespace.nspname = c.table_schema
        AND pg_namespace.oid = pg_class.relnamespace
    JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid
        AND pg_attribute.attname = c.column_name
    LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
        AND pg_description.objsubid = pg_attribute.attnum
WHERE
    c.table_schema = 'upchieve'
    AND pg_description.description IS NOT NULL
    AND (pg_description.description LIKE 'pii%'
        OR pg_description.description LIKE 'not_pii%');

-- migrate:down
DROP VIEW IF EXISTS upchieve.table_descriptions;

DROP VIEW IF EXISTS upchieve.column_descriptions;

