-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('UNKNOWN');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold)
SELECT
    'contextual',
    id,
    0.75
FROM
    upchieve.moderation_categories
WHERE
    name = 'UNKNOWN';

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'contextual'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            name = 'UNKNOWN');

DELETE FROM upchieve.moderation_categories
WHERE name = 'UNKNOWN';
