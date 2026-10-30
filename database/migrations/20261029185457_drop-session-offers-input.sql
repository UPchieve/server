-- migrate:up
ALTER TABLE upchieve.session_offers
    DROP COLUMN input;

-- migrate:down
ALTER TABLE upchieve.session_offers
    ADD COLUMN input jsonb;

ALTER TABLE upchieve.session_offers
    ADD CONSTRAINT session_offers_input_check CHECK (jsonb_typeof(input) = 'array');

COMMENT ON COLUMN upchieve.session_offers.input IS 'not_pii: Deprecated, no longer written. Candidates are in output.ranked[].candidate';

