-- migrate:up
INSERT INTO upchieve.moderation_type (name)
    VALUES ('image_upload');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold, penalty_weight)
SELECT
    'image_upload',
    mc.id,
    settings.threshold,
    settings.penalty_weight
FROM (
    VALUES ('Person detected in image', 0.75, 10),
        ('Violence', 0.75, 10),
        ('Visually Disturbing', 0.75, 10),
        ('Non-Explicit Nudity of Intimate parts and Kissing', 0.75, 10),
        ('Swimwear or Underwear', 0.75, 10),
        ('VIOLENCE_OR_THREAT', 0.75, 10),
        ('Explicit', 0.75, 10),
        ('GRAPHIC', 0.75, 10),
        ('HARASSMENT_OR_ABUSE', 0.75, 10),
        ('SEXUAL', 0.75, 10),
        ('LINK', 0.85, 4),
        ('PHONE', 0.85, 4),
        ('EMAIL', 0.85, 4),
        ('Alcohol', 0.75, 4),
        ('ADDRESS', 0.85, 4),
        ('PROFANITY', 0.85, 1),
        ('INSULT', 0.85, 1),
        ('Rude Gestures', 0.85, 1),
        ('Drugs & Tobacco', 0.75, 1),
        ('Gambling', 0.75, 1),
        ('HATE_SPEECH', 0.85, 1),
        ('Hate Symbols', 0.75, 1),
        ('Low Confidence / Ambiguous Content', 0.75, 0)) AS settings (category_name, threshold, penalty_weight)
    JOIN upchieve.moderation_categories mc ON mc.name = settings.category_name;

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'image_upload';

DELETE FROM upchieve.moderation_type
WHERE name = 'image_upload';

