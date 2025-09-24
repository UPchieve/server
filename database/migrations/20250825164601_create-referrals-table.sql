-- migrate:up
CREATE TABLE upchieve.referrals (
    id serial PRIMARY KEY,
    referred_by uuid REFERENCES upchieve.users (id),
    user_id uuid REFERENCES upchieve.users (id)
);

-- migrate:down
DROP TABLE upchieve.referrals;

