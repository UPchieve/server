/* @name getConfidenceRating */
SELECT confidence_rating FROM contextual_moderation_confidence_thresholds WHERE flag_reason = :flagReason!;