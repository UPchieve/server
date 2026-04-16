/* @name insertTextModerationPattern */
INSERT INTO text_moderation_patterns (regex, flags, rules)
    VALUES (:regex!, :flags, :rules)
RETURNING
    *;


/* @name getTextModerationPatterns */
SELECT
    *
FROM
    text_moderation_patterns;

