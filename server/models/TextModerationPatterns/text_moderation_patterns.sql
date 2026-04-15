/* @name insertTextModerationPattern */
INSERT INTO text_moderation_patterns (regex, rules)
    VALUES (:regex!, :rules)
RETURNING
    *;


/* @name getTextModerationPatterns */
SELECT
    *
FROM
    text_moderation_patterns;

