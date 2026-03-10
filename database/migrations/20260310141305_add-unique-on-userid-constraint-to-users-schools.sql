-- migrate:up
ALTER TABLE upchieve.users_schools
    ADD CONSTRAINT users_schools_unique_user_id UNIQUE (user_id);

ALTER TABLE upchieve.users_schools
    DROP CONSTRAINT unique_user_school;

-- migrate:down
ALTER TABLE upchieve.users_schools
    DROP CONSTRAINT users_schools_unique_user_id;

ALTER TABLE upchieve.users_schools
    ADD CONSTRAINT unique_user_school UNIQUE (user_id, school_id);

