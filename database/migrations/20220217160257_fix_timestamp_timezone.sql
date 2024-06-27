-- migrate:up
ALTER TABLE upchieve.admin_profiles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.assistments_data
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN sent_at TYPE timestamptz;

ALTER TABLE upchieve.availabilities
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.availability_histories
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN recorded_at TYPE timestamptz;

ALTER TABLE upchieve.ban_reasons
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.certification_subject_unlocks
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.certifications
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.cities
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.grade_levels
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.ip_addresses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.legacy_availability_histories
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN recorded_at TYPE timestamptz;

ALTER TABLE upchieve.notification_methods
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.notification_priority_groups
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.notification_types
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.notifications
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN sent_at TYPE timestamptz;

ALTER TABLE upchieve.photo_id_statuses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.postal_codes
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.quiz_certification_grants
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.quiz_questions
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.quiz_subcategories
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.quizzes
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.references
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN sent_at TYPE timestamptz;

ALTER TABLE upchieve.report_reasons
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.required_email_domains
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.school_nces_metadata
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.schools
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.schools_sponsor_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.session_flags
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.session_reports
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.sessions
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN ended_at TYPE timestamptz,
    ALTER COLUMN volunteer_joined_at TYPE timestamptz;

ALTER TABLE upchieve.sessions_session_flags
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.signup_sources
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.sponsor_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_org_sites
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_orgs_sponsor_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_profiles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.subjects
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.tool_types
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.topics
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.training_courses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.us_states
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.user_product_flags
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.user_roles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.user_session_metrics
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.users
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz,
    ALTER COLUMN last_activity_at TYPE timestamptz;

ALTER TABLE upchieve.users_certifications
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.users_ip_addresses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.users_quizzes
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.users_roles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.users_training_courses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.volunteer_partner_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.volunteer_profiles
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.volunteer_reference_statuses
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.weekdays
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamptz,
    ALTER COLUMN updated_at TYPE timestamptz;

-- migrate:down
ALTER TABLE upchieve.admin_profiles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.assistments_data
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN sent_at TYPE timestamp;

ALTER TABLE upchieve.availabilities
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.availability_histories
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN recorded_at TYPE timestamp;

ALTER TABLE upchieve.ban_reasons
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.certification_subject_unlocks
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.certifications
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.cities
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.grade_levels
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.ip_addresses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.legacy_availability_histories
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN recorded_at TYPE timestamp;

ALTER TABLE upchieve.notification_methods
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.notification_priority_groups
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.notification_types
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.notifications
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN sent_at TYPE timestamp;

ALTER TABLE upchieve.photo_id_statuses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.postal_codes
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.quiz_certification_grants
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.quiz_questions
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.quiz_subcategories
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.quizzes
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.references
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN sent_at TYPE timestamp;

ALTER TABLE upchieve.report_reasons
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.required_email_domains
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.school_nces_metadata
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.schools
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.schools_sponsor_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.session_flags
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.session_reports
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.sessions
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN ended_at TYPE timestamp,
    ALTER COLUMN volunteer_joined_at TYPE timestamp;

ALTER TABLE upchieve.sessions_session_flags
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.signup_sources
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.sponsor_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_org_sites
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_orgs_sponsor_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_profiles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.subjects
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.tool_types
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.topics
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.training_courses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.us_states
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.user_product_flags
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.user_roles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.user_session_metrics
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.users
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp,
    ALTER COLUMN last_activity_at TYPE timestamp;

ALTER TABLE upchieve.users_certifications
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.users_ip_addresses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.users_quizzes
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.users_roles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.users_training_courses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.volunteer_partner_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.volunteer_profiles
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.volunteer_reference_statuses
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.weekdays
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

ALTER TABLE upchieve.student_partner_orgs
    ALTER COLUMN created_at TYPE timestamp,
    ALTER COLUMN updated_at TYPE timestamp;

