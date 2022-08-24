-- migrate:up
ALTER TABLE upchieve.assistments_data
    ADD CONSTRAINT assistments_data_student_id_fkey FOREIGN KEY (student_id) REFERENCES upchieve.users (id),
    ADD CONSTRAINT assistments_data_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions (id);

ALTER TABLE upchieve.users_roles
    ADD CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users (id)
    -- migrate:down
        ALTER TABLE upchieve.assistments_data
        DROP CONSTRAINT assistments_data_student_id_fkey,
        DROP CONSTRAINT assistments_data_session_id_fkey;

ALTER TABLE upchieve.users_roles
    DROP CONSTRAINT users_roles_user_id_fkey
