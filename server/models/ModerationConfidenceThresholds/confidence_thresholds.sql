/* @name getConfidenceThresholdsByModerationType */
SELECT
    mc.name,
    ms.threshold
FROM
    moderation_settings ms
    JOIN moderation_categories mc ON ms.moderation_category_id = mc.id
WHERE
    ms.moderation_type = :moderationType!;

