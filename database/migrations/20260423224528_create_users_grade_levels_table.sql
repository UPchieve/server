-- migrate:up
CREATE TABLE upchieve.users_grade_levels (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    signup_grade_level_id int REFERENCES upchieve.grade_levels (id),
    grade_level_id int NOT NULL REFERENCES upchieve.grade_levels (id),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_grade_levels;

