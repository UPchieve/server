-- migrate:up
ALTER TABLE upchieve.volunteer_occupations
    DROP CONSTRAINT unique_user_id_occupation;

ALTER TABLE upchieve.volunteer_occupations
    ADD CONSTRAINT pk_user_id_occupation PRIMARY KEY (user_id, occupation);

-- migrate:down
ALTER TABLE upchieve.volunteer_occupations
    DROP CONSTRAINT pk_user_id_occupation;

ALTER TABLE upchieve.volunteer_occupations
    ADD CONSTRAINT unique_user_id_occupation UNIQUE (user_id, occupation);

