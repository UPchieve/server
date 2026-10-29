-- migrate:up
ALTER TABLE upchieve.session_offers
    ALTER COLUMN input DROP NOT NULL;

COMMENT ON COLUMN upchieve.session_offers.input IS 'not_pii: Deprecated, no longer written. Candidates are in output.ranked[].candidate';

-- migrate:down
UPDATE
    upchieve.session_offers
SET
    input = '[]'::jsonb
WHERE
    input IS NULL;

ALTER TABLE upchieve.session_offers
    ALTER COLUMN input SET NOT NULL;

COMMENT ON COLUMN upchieve.session_offers.input IS 'not_pii: Candidates passed to match scoring';

