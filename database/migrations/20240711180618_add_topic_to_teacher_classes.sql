-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ADD COLUMN topic_id integer REFERENCES upchieve.topics (id);

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    DROP COLUMN topic_id;

