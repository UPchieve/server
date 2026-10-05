-- migrate:up
SET LOCAL lock_timeout = '5s';

CREATE TABLE upchieve.nths_group_member_title_histories (
    id uuid PRIMARY KEY DEFAULT upchieve.generate_ulid (),
    nths_group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text,
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX nths_group_member_title_histories_nths_group_id_user_id_idx ON upchieve.nths_group_member_title_histories (nths_group_id, user_id);

COMMENT ON TABLE upchieve.nths_group_member_title_histories IS 'Append only log of every title given to an NTHS group member, written by a trigger on upchieve.nths_group_members and seeded once with the titles held when it was created';

COMMENT ON COLUMN upchieve.nths_group_member_title_histories.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_group_member_title_histories.nths_group_id IS 'not_pii: ID of the upchieve.nths_groups row';

COMMENT ON COLUMN upchieve.nths_group_member_title_histories.user_id IS 'not_pii: ID of the upchieve.users row';

COMMENT ON COLUMN upchieve.nths_group_member_title_histories.title IS 'not_pii: Title the member was given';

COMMENT ON COLUMN upchieve.nths_group_member_title_histories.recorded_at IS 'not_pii: When the title was recorded; rows from the one-off seed hold the seed time';

CREATE FUNCTION upchieve.record_nths_group_member_title ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.title IS DISTINCT FROM OLD.title THEN
        INSERT INTO upchieve.nths_group_member_title_histories (nths_group_id, user_id, title)
            VALUES (NEW.nths_group_id, NEW.user_id, NEW.title);
    END IF;
    RETURN NULL;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trg_record_nths_group_member_title
    AFTER INSERT OR UPDATE OF title ON upchieve.nths_group_members
    FOR EACH ROW
    EXECUTE FUNCTION upchieve.record_nths_group_member_title ();

-- migrate:down
SET LOCAL lock_timeout = '5s';

DROP TRIGGER trg_record_nths_group_member_title ON upchieve.nths_group_members;

DROP FUNCTION upchieve.record_nths_group_member_title;

DROP TABLE upchieve.nths_group_member_title_histories;

