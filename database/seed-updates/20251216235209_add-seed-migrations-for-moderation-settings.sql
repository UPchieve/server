-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('PII'), ('HATE_SPEECH'), ('PLATFORM_CIRCUMVENTION'), ('INAPPROPRIATE_CONTENT'), ('SAFETY');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold)
SELECT
    'contextual',
    id,
.75
FROM
    upchieve.moderation_categories
WHERE
    name IN ('PII', 'HATE_SPEECH', 'PLATFORM_CIRCUMVENTION', 'INAPPROPRIATE_CONTENT', 'SAFETY');

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'contextual'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            name IN ('PII', 'HATE_SPEECH', 'PLATFORM_CIRCUMVENTION', 'INAPPROPRIATE_CONTENT', 'SAFETY'));

DELETE FROM upchieve.moderation_categories
WHERE name IN ('PII', 'HATE_SPEECH', 'PLATFORM_CIRCUMVENTION', 'INAPPROPRIATE_CONTENT', 'SAFETY');

