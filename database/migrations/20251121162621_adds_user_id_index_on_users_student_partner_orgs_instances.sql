-- migrate:up
CREATE INDEX uspoi_user_id_idx ON upchieve.users_student_partner_orgs_instances (user_id);

-- migrate:down
DROP INDEX upchieve.uspoi_user_id_idx;

