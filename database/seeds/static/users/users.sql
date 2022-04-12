/* @name insertBanReason */
INSERT INTO ban_reasons (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertGradeLevel */
INSERT INTO grade_levels (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertPhotoIdStatus */
INSERT INTO photo_id_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSignupSource */
INSERT INTO signup_sources (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertUserRole */
INSERT INTO user_roles (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertVolunteerReferenceStatus */
INSERT INTO volunteer_reference_statuses (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;
