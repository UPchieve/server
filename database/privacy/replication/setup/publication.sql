DO $$
BEGIN
    IF current_database() <> 'upchieve' THEN
        RAISE EXCEPTION 'Refusing to run: connected to database "%", expected "upchieve"', current_database();
    END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS aiven_extras CASCADE;

SELECT
    *
FROM
    aiven_extras.pg_create_publication ('pub_masking', 'INSERT,UPDATE,DELETE,TRUNCATE', VARIADIC (
            SELECT
                array_agg(quote_ident(schemaname) || '.' || quote_ident(tablename))
FROM pg_tables
WHERE
    schemaname IN ('upchieve')));

