-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.quiz_certification_grants (
    quiz_id int NOT NULL REFERENCES upchieve.quizzes (id),
    certification_id int NOT NULL REFERENCES upchieve.certifications (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (certification_id, quiz_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.quiz_certification_grants CASCADE;

