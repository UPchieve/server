-- migrate:up
CREATE INDEX users_subjects_mview_user_id_idx ON upchieve.users_subjects_mview (user_id);

-- migrate:down
DROP INDEX upchieve.users_subjects_mview_user_id_idx;

