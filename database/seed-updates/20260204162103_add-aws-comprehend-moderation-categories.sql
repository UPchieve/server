-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('GRAPHIC'), ('HARASSMENT_OR_ABUSE'), ('HATE_SPEECH_REAL_TIME'), ('SEXUAL'), ('VIOLENCE_OR_THREAT'), ('INSULT'), ('PROFANITY'), ('EMAIL'), ('URL'), ('PHONE'), ('ADDRESS');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold)
SELECT
    'realtime_image',
    id,
    0.85
FROM
    upchieve.moderation_categories
WHERE
    name IN ('GRAPHIC', 'HARASSMENT_OR_ABUSE', 'HATE_SPEECH_REAL_TIME', 'SEXUAL', 'VIOLENCE_OR_THREAT', 'INSULT', 'PROFANITY', 'EMAIL', 'URL', 'PHONE', 'ADDRESS');

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            name IN ('GRAPHIC', 'HARASSMENT_OR_ABUSE', 'SEXUAL', 'HATE_SPEECH_REAL_TIME', 'VIOLENCE_OR_THREAT', 'INSULT', 'PROFANITY', 'EMAIL', 'URL', 'PHONE', 'ADDRESS'));

DELETE FROM upchieve.moderation_categories
WHERE name IN ('GRAPHIC', 'HARASSMENT_OR_ABUSE', 'SEXUAL', 'HATE_SPEECH_REAL_TIME', 'VIOLENCE_OR_THREAT', 'INSULT', 'PROFANITY', 'EMAIL', 'URL', 'PHONE', 'ADDRESS');

