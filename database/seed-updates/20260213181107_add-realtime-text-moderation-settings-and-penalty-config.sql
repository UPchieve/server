-- migrate:up
INSERT INTO upchieve.moderation_penalty_config (min_weight, max_weight, moderation_type)
    VALUES (0, 10, 'realtime_text');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    1
FROM
    upchieve.moderation_categories
WHERE
    name = 'PROFANITY';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    1
FROM
    upchieve.moderation_categories
WHERE
    name = 'HATE_SPEECH';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    1
FROM
    upchieve.moderation_categories
WHERE
    name = 'RUDE';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    4
FROM
    upchieve.moderation_categories
WHERE
    name = 'EMAIL';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    4
FROM
    upchieve.moderation_categories
WHERE
    name = 'PHONE';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    4
FROM
    upchieve.moderation_categories
WHERE
    name = 'OTHER_CONTACT_INFO';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.75,
    0
FROM
    upchieve.moderation_categories
WHERE
    name = 'SAFETY';

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'realtime_text',
    moderation_categories.id,
    0.85,
    1
FROM
    upchieve.moderation_categories
WHERE
    name = 'OTHER';

-- migrate:down
DELETE FROM upchieve.moderation_penalty_config
WHERE moderation_type = 'realtime_text';

DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'realtime_text';

