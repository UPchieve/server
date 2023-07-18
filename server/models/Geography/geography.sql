/* @name upsertCity */
WITH ins AS (
INSERT INTO cities (name, us_state_code)
        VALUES (:name!, :state!)
    ON CONFLICT (name, us_state_code)
        DO NOTHING
    RETURNING
        id)
    SELECT
        id
    FROM
        ins
    UNION
    SELECT
        id
    FROM
        cities
    WHERE
        name = :name!
            AND us_state_code = :state;

