-- migrate:up
ALTER TABLE upchieve.student_profiles
    DROP COLUMN grade_level_id;

-- migrate:down
ALTER TABLE upchieve.student_profiles
    ADD COLUMN grade_level_id int REFERENCES upchieve.grade_levels (id);

