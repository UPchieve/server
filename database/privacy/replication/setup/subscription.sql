DO $$
BEGIN
    IF current_database() <> 'upchieve' THEN
        RAISE EXCEPTION 'Refusing to run: connected to database "%", expected "upchieve"', current_database();
    END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS aiven_extras CASCADE;

\getenv sub_name SUB_NAME
\getenv connection_string CONNECTION_STRING
\getenv pub_name PUB_NAME
\getenv slot_name SLOT_NAME
\getenv create_slot CREATE_SLOT
\getenv copy_data COPY_DATA

SELECT
    *
FROM
    aiven_extras.pg_create_subscription (:'sub_name', :'connection_string', :'pub_name', :'slot_name', :'create_slot'::boolean, :'copy_data'::boolean);

