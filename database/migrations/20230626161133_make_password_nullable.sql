-- migrate:up
ALTER TABLE upchieve.users
ALTER COLUMN password DROP NOT NULL;


-- migrate:down
ALTER TABLE upchieve.users
ALTER COLUMN password SET NOT NULL;


