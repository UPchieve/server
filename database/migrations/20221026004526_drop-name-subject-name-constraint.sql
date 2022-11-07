-- migrate:up
ALTER TABLE ONLY upchieve.subjects
    DROP CONSTRAINT subjects_display_name_key;

-- migrate:down
ALTER TABLE ONLY upchieve.subjects
    ADD CONSTRAINT subjects_display_name_key UNIQUE (display_name);

