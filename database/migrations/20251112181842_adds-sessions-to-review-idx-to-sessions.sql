-- migrate:up
CREATE INDEX sessions_to_review_idx ON upchieve.sessions (to_review);

-- migrate:down
DROP INDEX upchieve.sessions_to_review_idx;

