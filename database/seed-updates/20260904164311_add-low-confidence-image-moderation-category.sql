-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('Low Confidence / Ambiguous Content');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold)
SELECT
    'realtime_image',
    id,
    0.50
FROM
    upchieve.moderation_categories
WHERE
    name = 'Low Confidence / Ambiguous Content';

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            name = 'Low Confidence / Ambiguous Content');

DELETE FROM upchieve.moderation_categories
WHERE name = 'Low Confidence / Ambiguous Content';

