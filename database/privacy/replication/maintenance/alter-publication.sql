DO $$
BEGIN
    IF current_database() <> 'upchieve' THEN
        RAISE EXCEPTION 'Refusing to run: connected to database "%", expected "upchieve"', current_database();
    END IF;
END
$$;

-- Alter the publication so that we add every `upchieve` table that is not already published.
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT
            t.schemaname,
            t.tablename
        FROM
            pg_tables t
        WHERE
            t.schemaname = 'upchieve'
            AND NOT EXISTS (
                SELECT
                    1
                FROM
                    pg_publication_tables p
                WHERE
                    p.pubname = 'pub_masking'
                    AND p.schemaname = t.schemaname
                    AND p.tablename = t.tablename)
    LOOP
        EXECUTE format('ALTER PUBLICATION pub_masking ADD TABLE %I.%I', r.schemaname, r.tablename);
        RAISE NOTICE 'Added %.% to pub_masking', r.schemaname, r.tablename;
    END LOOP;
END
$$;
