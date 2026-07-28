-- migrate:up transaction:false
CREATE INDEX CONCURRENTLY presence_actions_created_at_idx ON upchieve.user_actions (created_at) INCLUDE (user_id, clientuuid, action, id)
WHERE
    action IN ('ACTIVE_ON_SITE', 'PASSIVE_ON_SITE', 'INACTIVE_ON_SITE');

-- migrate:down transaction:false
DROP INDEX CONCURRENTLY upchieve.presence_actions_created_at_idx;

