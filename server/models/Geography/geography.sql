/* @name upsertCity */
WITH ins AS (
INSERT INTO cities (name, us_state_code, created_at, updated_at)
        VALUES (:name!, :state!, NOW(), NOW())
    ON CONFLICT (name, us_state_code)
        DO NOTHING
    RETURNING
        id)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        id
    FROM
        cities
    WHERE
        name = :name!;

