-- migrate:up
ALTER TABLE upchieve.sessions
ADD COLUMN shadowbanned boolean;

UPDATE upchieve.sessions
SET shadowbanned = TRUE
WHERE student_banned = TRUE;

-- migrate:down
ALTER TABLE upchieve.sessions
DROP COLUMN shadowbanned;

