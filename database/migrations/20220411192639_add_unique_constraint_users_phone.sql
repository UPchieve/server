-- migrate:up
ALTER TABLE upchieve.users
ADD CONSTRAINT unique_user_phone UNIQUE (phone);

-- migrate:down
ALTER TABLE upchieve.users
DELETE CONSTRAINT unique_user_phone;
