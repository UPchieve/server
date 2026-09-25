-- migrate:up
CREATE TYPE upchieve.volunteer_info_type AS ENUM (
    'occupation',
    'totalVolunteerHours',
    'numStudentsHelped',
    'numSessionsTutored'
);

ALTER TABLE upchieve.volunteer_profiles
    ADD COLUMN info_shared_with_students upchieve.volunteer_info_type[];

COMMENT ON COLUMN upchieve.volunteer_profiles.info_shared_with_students IS 'not_pii: Data the volunteer has chosen to share with the student. Empty array means they chose to share nothing; null means they have not yet made a choice.';

-- migrate:down
ALTER TABLE upchieve.volunteer_profiles
    DROP COLUMN info_shared_with_students;

DROP TYPE upchieve.volunteer_info_type;

