-- migrate:up
ALTER TABLE upchieve.tutor_bot_conversations
    ADD COLUMN subject_id integer NOT NULL,
    ADD FOREIGN KEY (subject_id) REFERENCES upchieve.subjects (id);

-- migrate:down
ALTER TABLE upchieve.tutor_bot_conversations
    DROP COLUMN subject_id;

