-- migrate:up
CREATE TYPE upchieve.user_school_association_type AS ENUM (
    'student_at_school',
    'teacher_at_school'
);

CREATE TABLE upchieve.users_schools (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    school_id uuid NOT NULL REFERENCES upchieve.schools (id),
    association_type upchieve.user_school_association_type NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

ALTER TABLE upchieve.users_schools
    ADD CONSTRAINT unique_user_school UNIQUE (user_id, school_id);

CREATE INDEX users_schools_user_id ON upchieve.users_schools (user_id);

CREATE INDEX users_schools_school_id ON upchieve.users_schools (school_id);

-- migrate:down
DROP TABLE upchieve.users_schools;

DROP TYPE upchieve.user_school_association_type;

