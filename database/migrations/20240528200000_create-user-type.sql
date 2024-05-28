-- migrate:up
CREATE TYPE upchieve.user_type AS ENUM (
    'student',
    'volunteer',
    'teacher'
);

-- migrate:down
DROP TYPE IF EXISTS upchieve.user_type;

