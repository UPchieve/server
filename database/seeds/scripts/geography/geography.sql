/* @name insertUsState */
WITH ins AS(
    INSERT INTO us_states (name, code, created_at, updated_at)
        VALUES (:name!, :code!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        name AS ok
)
SELECT * FROM ins
UNION
    SELECT name AS ok FROM us_states WHERE name=:name! AND code=:code!;


/* @name insertZipCode */
WITH ins AS(
    INSERT INTO postal_codes (code, us_state_code, income, LOCATION, created_at, updated_at)
        VALUES (:code!, :usStateCode!, :income!, POINT(:lattitude!, :longitude!), NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        code AS ok
)
SELECT * FROM ins
UNION
    SELECT code AS ok FROM postal_codes WHERE code=:code! AND us_state_code=:usStateCode!;

/* @name insertWeekday */
WITH ins AS(
    INSERT INTO weekdays (day, created_at, updated_at)
        VALUES (:day!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM weekdays WHERE day=:day!;
