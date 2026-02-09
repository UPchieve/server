-- migrate:up
INSERT INTO upchieve.moderation_penalty_config (min_weight, max_weight, moderation_type)
    VALUES (0, 10, 'contextual'), (0, 10, 'realtime_image');

UPDATE
    upchieve.moderation_settings
SET
    penalty_weight = 0;

UPDATE
    upchieve.moderation_settings
SET
    penalty_weight = 10
WHERE
    moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            lower(name) IN ('violence', 'swimwear or underwear', 'explicit', 'non-explicit nudity of intimate parts and kissing', 'hate symbols', 'visually disturbing', 'graphic', 'harassment_or_abuse', 'sexual', 'violence_or_threat', 'person detected in image'));

UPDATE
    upchieve.moderation_settings
SET
    penalty_weight = 4
WHERE
    moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            lower(name) IN ('link', 'email', 'address', 'phone'));

UPDATE
    upchieve.moderation_settings
SET
    penalty_weight = 1
WHERE
    moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            lower(name) IN ('gambling', 'profanity', 'drugs & tobacco', 'alcohol', 'hate symbols', 'rude gestures', 'hate_speech', 'insult'));

-- migrate:down
DELETE FROM upchieve.moderation_penalty_config
WHERE moderation_type IN ('contextual', 'realtime_image');

UPDATE
    upchieve.moderation_settings
SET
    penalty_weight = 0;

