-- migrate:up
ALTER TABLE upchieve.session_offers RENAME COLUMN policy_version TO scorecard_version;

ALTER TABLE upchieve.session_offers
    DROP CONSTRAINT session_offers_outcome_check;

ALTER TABLE upchieve.session_offers
    ADD CONSTRAINT session_offers_outcome_check CHECK (outcome IN ('accepted', 'declined', 'expired', 'withdrawn-by-student', 'shadow-offered'));

COMMENT ON TABLE upchieve.session_offers IS 'Closed offers of a session to a single coach, chosen by scoring eligible coaches. The shadow-offered outcome is used for debugging, they are generated but never sent to a user';

COMMENT ON COLUMN upchieve.session_offers.scorecard_version IS 'not_pii: The scorecard used when making the offer';

COMMENT ON COLUMN upchieve.session_offers.output IS 'not_pii: Match scoring result (scorecard version and ranked candidates)';

-- migrate:down
ALTER TABLE upchieve.session_offers RENAME COLUMN scorecard_version TO policy_version;

ALTER TABLE upchieve.session_offers
    DROP CONSTRAINT session_offers_outcome_check;

ALTER TABLE upchieve.session_offers
    ADD CONSTRAINT session_offers_outcome_check CHECK (outcome IN ('accepted', 'declined', 'expired', 'withdrawn-by-student', 'not-offered'));

COMMENT ON TABLE upchieve.session_offers IS 'Closed offers of a session to a single coach, chosen by scoring eligible coaches. The not-offered outcome is used for debugging, they are generated but never sent to a user';

COMMENT ON COLUMN upchieve.session_offers.policy_version IS 'not_pii: The policy used when making the offer';

COMMENT ON COLUMN upchieve.session_offers.output IS 'not_pii: Match scoring result (policy version and ranked candidates)';

