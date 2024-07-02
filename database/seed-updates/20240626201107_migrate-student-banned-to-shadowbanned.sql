-- migrate:up
UPDATE
    upchieve.sessions
SET
    shadowbanned = TRUE
WHERE
    student_banned = TRUE;

-- Set 'shadowbanned' to FALSE wherever 'student_banned' is FALSE
UPDATE
    upchieve.sessions
SET
    shadowbanned = FALSE
WHERE
    student_banned = FALSE;

-- migrate:down
UPDATE
    upchieve.sessions
SET
    shadowbanned = NULL;

