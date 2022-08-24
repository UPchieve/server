-- migrate:up
CREATE OR REPLACE FUNCTION upchieve.generate_ulid ()
    RETURNS uuid
    AS $$
DECLARE
    timestamp bytea = E'\\000\\000\\000\\000\\000\\000';
    unix_time bigint;
    ulid bytea;
BEGIN
    -- 6 timestamp bytes
    unix_time = (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint;
    timestamp = SET_BYTE(timestamp, 0, (unix_time >> 40)::bit(8)::integer);
    timestamp = SET_BYTE(timestamp, 1, (unix_time >> 32)::bit(8)::integer);
    timestamp = SET_BYTE(timestamp, 2, (unix_time >> 24)::bit(8)::integer);
    timestamp = SET_BYTE(timestamp, 3, (unix_time >> 16)::bit(8)::integer);
    timestamp = SET_BYTE(timestamp, 4, (unix_time >> 8)::bit(8)::integer);
    timestamp = SET_BYTE(timestamp, 5, unix_time::bit(8)::integer);
    -- 10 entropy bytes
    ulid = timestamp || public.gen_random_bytes(10);
    RETURN CAST(substring(CAST(ulid AS text)
            FROM 3) AS uuid);
END
$$
LANGUAGE plpgsql
VOLATILE;

-- migrate:down
DROP FUNCTION IF EXISTS upchieve.generate_ulid;

