-- migrate:up
ALTER TABLE upchieve.users_training_courses
    ADD CONSTRAINT user_id_training_course_id_unique UNIQUE (user_id, training_course_id);

-- migrate:down
ALTER TABLE upchieve.users_training_courses
    DROP CONSTRAINT user_id_training_course_id_unique;

