-- migrate:up
INSERT INTO upchieve.contextual_moderation_confidence_thresholds(flag_reason, confidence_rating, created_at, updated_at) 
VALUES ('PII', 75, NOW(), NOW()), ('HATE_SPEECH', 75, NOW(), NOW()), ('PLATFORM_CIRCUMVENTION', 75, NOW(), NOW()), ('INAPPROPRIATE_CONTENT', 75, NOW(), NOW()), ('SAFETY', 75, NOW(), NOW());

-- migrate:down
DELETE FROM upchieve.contextual_moderation_confidence_thresholds WHERE flag_reason IN ('PII', 'HATE_SPEECH', 'PLATFORM_CIRCUMVENTION', 'INAPPROPRIATE_CONTENT', 'SAFETY');