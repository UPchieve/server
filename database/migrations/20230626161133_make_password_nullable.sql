-- migrate:up
ALTER TABLE upchieve.users
    ALTER COLUMN PASSWORD DROP NOT NULL;

-- migrate:down
ALTER TABLE upchieve.users
    ALTER COLUMN PASSWORD SET NOT NULL;

