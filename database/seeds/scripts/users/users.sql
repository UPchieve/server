/* @name insertBanReason */
WITH ins AS(
    INSERT INTO ban_reasons (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM ban_reasons WHERE name=:name!;


/* @name insertGradeLevel */
WITH ins AS(
    INSERT INTO grade_levels (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM grade_levels WHERE name=:name!;


/* @name insertPhotoIdStatus */
WITH ins AS(
    INSERT INTO photo_id_statuses (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM photo_id_statuses WHERE name=:name!;


/* @name insertSignupSource */
WITH ins AS(
    INSERT INTO signup_sources (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM signup_sources WHERE name=:name!;


/* @name insertUserRole */
WITH ins AS(
    INSERT INTO user_roles (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM user_roles WHERE name=:name!;


/* @name insertVolunteerReferenceStatus */
WITH ins AS(
    INSERT INTO volunteer_reference_statuses (name, created_at, updated_at)
        VALUES (:name!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM volunteer_reference_statuses WHERE name=:name!;

