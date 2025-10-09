-- migrate:up
CREATE OR REPLACE FUNCTION upchieve.refresh_users_subjects_unlocked_mview ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview;
    RETURN new;
END;
$$;

-- migrate:down
CREATE OR REPLACE FUNCTION upchieve.refresh_users_subjects_unlocked_mview ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview;
    RETURN new;
END;
$$;

