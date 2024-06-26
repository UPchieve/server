-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.surveys_postsession (
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    subject_id integer NOT NULL REFERENCES upchieve.subjects (id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.surveys_postsession CASCADE;

