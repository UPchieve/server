-- migrate:up
CREATE TABLE upchieve.student_favorite_volunteers (
    student_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

ALTER TABLE ONLY upchieve.student_favorite_volunteers
    ADD CONSTRAINT student_favorite_volunteers_student_id_fkey FOREIGN KEY (student_id) REFERENCES upchieve.users (id),
    ADD CONSTRAINT student_favorite_volunteers_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES upchieve.users (id);

-- migrate:down
ALTER TABLE upchieve.student_favorite_volunteers
    DROP CONSTRAINT student_favorite_volunteers_student_id_fkey,
    DROP CONSTRAINT student_favorite_volunteers_volunteer_id_fkey;

DROP TABLE IF EXISTS upchieve.student_favorite_volunteers CASCADE;

