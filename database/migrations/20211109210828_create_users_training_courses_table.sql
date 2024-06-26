-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_training_courses (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    training_course_id int NOT NULL REFERENCES upchieve.training_courses (id),
    complete boolean NOT NULL DEFAULT FALSE,
    progress smallint NOT NULL DEFAULT 0 CHECK (progress >= 0) CHECK (progress <= 100),
    completed_materials text[],
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (user_id, training_course_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_training_courses CASCADE;

