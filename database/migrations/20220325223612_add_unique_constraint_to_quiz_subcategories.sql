-- migrate:up
ALTER TABLE upchieve.quiz_subcategories
    ADD CONSTRAINT name_quiz_id UNIQUE (name, quiz_id);

-- migrate:down
ALTER TABLE upchieve.quiz_subcategories
    DROP CONSTRAINT name_quiz_id;

