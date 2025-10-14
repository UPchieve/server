-- migrate:up
ALTER TABLE upchieve.referrals
    ADD CONSTRAINT referrals_user_id_key UNIQUE (user_id);

-- migrate:down
ALTER TABLE upchieve.referrals
    DROP CONSTRAINT referrals_user_id_key;

