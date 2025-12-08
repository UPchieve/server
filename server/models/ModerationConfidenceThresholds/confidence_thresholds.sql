/* @name getConfidenceThreshold */
SELECT
    ms.threshold
FROM
    upchieve.moderation_settings ms
    JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id
WHERE
    mc.name = :moderationCategory!
    AND ms.moderation_type = :moderationType!;

