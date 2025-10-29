-- migrate:up
CREATE INDEX avail_user_id_idx ON upchieve.availabilities (user_id uuid_ops);

CREATE INDEX fed_creds_user_id_idx ON upchieve.federated_credentials (user_id uuid_ops);

CREATE INDEX cgl_user_id_idx ON upchieve.current_grade_levels_mview (user_id uuid_ops);

-- migrate:down
DROP INDEX upchieve.avail_user_id_idx;

DROP INDEX upchieve.fed_creds_user_id_idx;

DROP INDEX upchieve.cgl_user_id_idx;

