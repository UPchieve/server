-- migrate:up
UPDATE
    upchieve.report_reasons
SET
    reason = '[Immediate ban] Student extremely rude/inappropriate',
    updated_at = 'now()'
WHERE
    reason = 'Student extremely rude/inappropriate';

-- migrate:down
UPDATE
    upchieve.report_reasons
SET
    reason = 'Student extremely rude/inappropriate',
    updated_at = 'now()'
WHERE
    reason = '[Immediate ban] Student extremely rude/inappropriate';

