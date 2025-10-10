-- migrate:up
ALTER MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview OWNER TO mat_view_owners;

-- migrate:down
DO $$
BEGIN
    -- Cloud environments use avnadmin
    ALTER MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview OWNER TO avnadmin;
EXCEPTION
    WHEN UNDEFINED_OBJECT THEN
        -- Other environments use subway
        ALTER MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview OWNER TO subway;
END
$$;

