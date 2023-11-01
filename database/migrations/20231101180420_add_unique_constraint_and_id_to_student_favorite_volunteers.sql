-- migrate:up
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    ADD CONSTRAINT unique_student_id_volunteer_id UNIQUE (student_id, volunteer_id);

ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    ADD COLUMN IF NOT EXISTS id SERIAL;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    DROP CONSTRAINT IF EXISTS unique_student_id_volunteer_id;

ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    DROP COLUMN IF EXISTS id;

