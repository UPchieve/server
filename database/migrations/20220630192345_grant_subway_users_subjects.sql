-- migrate:up
GRANT ALL PRIVILEGES ON upchieve.users_subjects_mview TO subway;
GRANT EXECUTE ON FUNCTION upchieve.refresh_users_subjects_mview TO subway;

-- migrate:down
REVOKE ALL PRIVILEGES ON upchieve.users_subjects_mview FROM subway;
REVOKE EXECUTE ON FUNCTION upchieve.refresh_users_subjects_mview FROM subway;
