-- migrate:up
ALTER TABLE upchieve.assistments_data
    DROP CONSTRAINT assistments_data_student_id_fkey;

-- migrate:down
ALTER TABLE upchieve.assistments_data
    ADD CONSTRAINT assistments_data_student_id_fkey FOREIGN KEY (student_id) REFERENCES upchieve.users (id);

