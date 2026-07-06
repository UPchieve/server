-- migrate:up
CREATE FUNCTION upchieve.freeze_signup_grade_level_id ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.signup_grade_level_id IS DISTINCT FROM OLD.signup_grade_level_id THEN
        RAISE EXCEPTION 'signup_grade_level_id cannot be changed after it is set';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_freeze_signup_grade_level_id
    BEFORE UPDATE OF signup_grade_level_id ON upchieve.users_grade_levels
    FOR EACH ROW
    EXECUTE FUNCTION upchieve.freeze_signup_grade_level_id ();

-- migrate:down
DROP TRIGGER trg_freeze_signup_grade_level_id ON upchieve.users_grade_levels;

DROP FUNCTION upchieve.freeze_signup_grade_level_id;

