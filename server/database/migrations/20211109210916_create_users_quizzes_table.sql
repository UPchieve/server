-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_quizzes (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    quiz_id int NOT NULL REFERENCES upchieve.quizzes (id),
    attempts int NOT NULL DEFAULT 0,
    passed boolean NOT NULL DEFAULT FALSE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (user_id, quiz_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_quizzes CASCADE;

