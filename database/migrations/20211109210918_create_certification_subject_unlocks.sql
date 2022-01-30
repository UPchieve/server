-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.certification_subject_unlocks (
    subject_id int NOT NULL REFERENCES upchieve.subjects (id),
    certification_id int NOT NULL REFERENCES upchieve.certifications (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (subject_id, certification_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.certification_subject_unlocks CASCADE;

