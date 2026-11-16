-- migrate:up
ALTER TYPE upchieve.volunteer_info_type
    ADD VALUE 'onlineStatus';

-- migrate:down
ALTER TYPE upchieve.volunteer_info_type RENAME TO volunteer_info_type_markedfordelete;

CREATE TYPE upchieve.volunteer_info_type AS ENUM (
    'occupation',
    'totalVolunteerHours',
    'numStudentsHelped',
    'numSessionsTutored'
);

ALTER TABLE upchieve.volunteer_profiles
    ALTER COLUMN info_shared_with_students TYPE upchieve.volunteer_info_type[]
    USING array_remove(info_shared_with_students, 'onlineStatus')::text[]::upchieve.volunteer_info_type[];

DROP TYPE upchieve.volunteer_info_type_markedfordelete;

