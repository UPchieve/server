-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('Explicit'), ('Non-Explicit Nudity of Intimate parts and Kissing'), ('Swimwear or Underwear'), ('Violence'), ('Visually Disturbing'), ('Drugs & Tobacco'), ('Alcohol'), ('Rude Gestures'), ('Gambling'), ('Hate Symbols'), ('Person');

INSERT INTO upchieve.moderation_settings (moderation_type, moderation_category_id, threshold)
SELECT
    'realtime_image',
    id,
    0.75
FROM
    upchieve.moderation_categories
WHERE
    name IN ('Explicit', 'Non-Explicit Nudity of Intimate parts and Kissing', 'Swimwear or Underwear', 'Violence', 'Visually Disturbing', 'Drugs & Tobacco', 'Alcohol', 'Rude Gestures', 'Gambling', 'Hate Symbols', 'Person');

-- migrate:down
DELETE FROM upchieve.moderation_settings
WHERE moderation_type = 'realtime_image'
    AND moderation_category_id IN (
        SELECT
            id
        FROM
            upchieve.moderation_categories
        WHERE
            name IN ('Explicit', 'Non-Explicit Nudity of Intimate parts and Kissing', 'Swimwear or Underwear', 'Violence', 'Visually Disturbing', 'Drugs & Tobacco', 'Alcohol', 'Rude Gestures', 'Gambling', 'Hate Symbols', 'Person'));

DELETE FROM upchieve.moderation_categories
WHERE name IN ('Explicit', 'Non-Explicit Nudity of Intimate parts and Kissing', 'Swimwear or Underwear', 'Violence', 'Visually Disturbing', 'Drugs & Tobacco', 'Alcohol', 'Rude Gestures', 'Gambling', 'Hate Symbols', 'Person');

