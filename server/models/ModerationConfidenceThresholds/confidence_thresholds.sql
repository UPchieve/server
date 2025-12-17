/* @name getContextualConfidenceThresholds */
SELECT
    mc.name,
    ms.threshold
FROM
    upchieve.moderation_settings ms
    JOIN upchieve.moderation_categories mc ON ms.moderation_category_id = mc.id
WHERE
    ms.moderation_type = 'contextual';

