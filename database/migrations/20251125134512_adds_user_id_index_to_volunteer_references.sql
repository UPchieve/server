-- migrate:up
CREATE INDEX volunteer_references_user_id_index ON upchieve.volunteer_references (user_id);

-- migrate:down
DROP INDEX upchieve.volunteer_references_user_id_index;

