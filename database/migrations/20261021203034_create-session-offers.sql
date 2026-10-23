-- migrate:up
CREATE TABLE upchieve.session_offers (
    id uuid PRIMARY KEY DEFAULT upchieve.generate_ulid (),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    volunteer_id uuid NOT NULL REFERENCES upchieve.users (id),
    offered_at timestamp with time zone NOT NULL,
    outcome text NOT NULL,
    policy_version text NOT NULL,
    closed_at timestamp with time zone NOT NULL,
    input jsonb NOT NULL,
    output jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT session_offers_outcome_check CHECK (outcome IN ('accepted', 'declined', 'expired', 'withdrawn-by-student', 'not-offered')),
    CONSTRAINT session_offers_input_check CHECK (jsonb_typeof(input) = 'array'),
    CONSTRAINT session_offers_output_check CHECK (jsonb_typeof(output) = 'object')
);

CREATE INDEX session_offers_session_id_idx ON upchieve.session_offers (session_id);

CREATE INDEX session_offers_volunteer_id_idx ON upchieve.session_offers (volunteer_id);

COMMENT ON TABLE upchieve.session_offers IS 'Closed offers of a session to a single coach, chosen by scoring eligible coaches. The not-offered outcome is used for debugging, they are generated but never sent to a user';

COMMENT ON COLUMN upchieve.session_offers.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_offers.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_offers.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the coach offered the session)';

COMMENT ON COLUMN upchieve.session_offers.offered_at IS 'not_pii: Time the session was offered to the coach';

COMMENT ON COLUMN upchieve.session_offers.policy_version IS 'not_pii: The policy used when making the offer';

COMMENT ON COLUMN upchieve.session_offers.outcome IS 'not_pii: How the offer closed';

COMMENT ON COLUMN upchieve.session_offers.closed_at IS 'not_pii: Time the offer closed';

COMMENT ON COLUMN upchieve.session_offers.input IS 'not_pii: Candidates passed to match scoring';

COMMENT ON COLUMN upchieve.session_offers.output IS 'not_pii: Match scoring result (policy version and ranked candidates)';

COMMENT ON COLUMN upchieve.session_offers.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_offers.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.session_offers;

