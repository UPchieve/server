-- migrate:up
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    ADD PRIMARY KEY (student_id, volunteer_id);

-- migrate:down
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    DROP CONSTRAINT IF EXISTS student_favorite_volunteers_pkey;

