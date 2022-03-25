/* @name upsertCity */
WITH ins AS(
  INSERT INTO cities (name, created_at, updated_at)
    VALUES (:name!, NOW(), NOW())
    ON CONFLICT(name) DO NOTHING
    RETURNING id
)
SELECT * FROM ins
UNION
SELECT id FROM cities WHERE name=:name!;
