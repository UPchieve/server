-- migrate:up
CREATE INDEX idx_users_referred_by ON upchieve.users (referred_by)
WHERE
    referred_by IS NOT NULL;

-- migrate:down
DROP INDEX idx_users_referred_by;

