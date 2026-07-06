-- migrate:up
COMMENT ON TABLE upchieve.admin_profiles IS '@deprecated - use upchieve.users_roles to determine whether a user is admin';

COMMENT ON COLUMN upchieve.admin_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.admin_profiles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.admin_profiles.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.assignments IS 'Assignments created by teachers for the students in their class';

COMMENT ON COLUMN upchieve.assignments.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.assignments.class_id IS 'not_pii: Foreign key to upchieve.teacher_classes';

COMMENT ON COLUMN upchieve.assignments.description IS 'not_pii: Free-text description of the assignment';

COMMENT ON COLUMN upchieve.assignments.title IS 'not_pii: Title of the assignment';

COMMENT ON COLUMN upchieve.assignments.number_of_sessions IS 'not_pii: Required number of tutoring sessions for the assignment';

COMMENT ON COLUMN upchieve.assignments.min_duration_in_minutes IS 'not_pii: Minimum session duration in minutes required by the assignment';

COMMENT ON COLUMN upchieve.assignments.due_date IS 'not_pii: Assignment due date';

COMMENT ON COLUMN upchieve.assignments.start_date IS 'not_pii: Assignment start date';

COMMENT ON COLUMN upchieve.assignments.is_required IS 'not_pii: Whether the assignment is required for the class';

COMMENT ON COLUMN upchieve.assignments.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.assignments.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.assignments.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.assistments_data IS '@deprecated - we no longer send data to ASSISTments';

COMMENT ON COLUMN upchieve.assistments_data.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.assistments_data.problem_id IS 'not_pii: ASSISTments problem identifier';

COMMENT ON COLUMN upchieve.assistments_data.assignment_id IS 'not_pii: Assignment id in the external system';

COMMENT ON COLUMN upchieve.assistments_data.student_id IS 'not_pii: Student id in the external system';

COMMENT ON COLUMN upchieve.assistments_data.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.assistments_data.sent IS 'not_pii: Whether the record has been sent to the external system';

COMMENT ON COLUMN upchieve.assistments_data.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.assistments_data.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.assistments_data.sent_at IS 'not_pii: Timestamp when the record was sent to the external system';

COMMENT ON COLUMN upchieve.assistments_data.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.associated_partners IS 'Join table for which student/volunteer partner organizations are associated with each other';

COMMENT ON COLUMN upchieve.associated_partners.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.associated_partners.key IS 'not_pii: Unique URL-safe slug';

COMMENT ON COLUMN upchieve.associated_partners.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.associated_partners.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.associated_partners.student_sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.associated_partners.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.associated_partners.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.availabilities IS 'The days/hours that volunteers have selected for receiving push notifications when a student needs help on the platform';

COMMENT ON COLUMN upchieve.availabilities.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.availabilities.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.availabilities.weekday_id IS 'not_pii: Foreign key to upchieve.weekdays';

COMMENT ON COLUMN upchieve.availabilities.available_start IS 'not_pii: Start hour of the availability window (0-23)';

COMMENT ON COLUMN upchieve.availabilities.available_end IS 'not_pii: End hour of the availability window (0-23)';

COMMENT ON COLUMN upchieve.availabilities.timezone IS 'pii: IANA timezone identifier';

COMMENT ON COLUMN upchieve.availabilities.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.availabilities.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.availability_histories IS 'All historical days/hours that volunteers had selected for availaibility on the platform';

COMMENT ON COLUMN upchieve.availability_histories.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.availability_histories.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.availability_histories.weekday_id IS 'not_pii: Foreign key to upchieve.weekdays';

COMMENT ON COLUMN upchieve.availability_histories.available_start IS 'not_pii: Start hour of the availability window (0-23)';

COMMENT ON COLUMN upchieve.availability_histories.available_end IS 'not_pii: End hour of the availability window (0-23)';

COMMENT ON COLUMN upchieve.availability_histories.timezone IS 'pii: IANA timezone identifier';

COMMENT ON COLUMN upchieve.availability_histories.recorded_at IS 'not_pii: Timestamp when the availability snapshot was taken';

COMMENT ON COLUMN upchieve.availability_histories.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.availability_histories.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.ban_reasons IS 'Reference table for reasons a user might be banned';

COMMENT ON COLUMN upchieve.ban_reasons.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.ban_reasons.name IS 'not_pii: Human-readable name of the ban reason';

COMMENT ON COLUMN upchieve.ban_reasons.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.ban_reasons.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.censored_session_messages IS 'Session messages that have been flagged by moderation';

COMMENT ON COLUMN upchieve.censored_session_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.censored_session_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';

COMMENT ON COLUMN upchieve.censored_session_messages.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.censored_session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.censored_session_messages.censored_by IS 'not_pii: Moderation system that flagged the message';

COMMENT ON COLUMN upchieve.censored_session_messages.sent_at IS 'not_pii: Timestamp when the message was sent';

COMMENT ON COLUMN upchieve.censored_session_messages.shown IS 'not_pii: Whether the non-censored message was shown to the recipient';

COMMENT ON TABLE upchieve.certification_subject_unlocks IS 'Indicates which certifications unlock which subjects a volunteer can tutor in';

COMMENT ON COLUMN upchieve.certification_subject_unlocks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.certification_subject_unlocks.certification_id IS 'not_pii: Foreign key to upchieve.certifications';

COMMENT ON COLUMN upchieve.certification_subject_unlocks.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.certification_subject_unlocks.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.certifications IS 'Lookup table of volunteer certifications that unlock tutoring subjects upon passing the associated quiz';

COMMENT ON COLUMN upchieve.certifications.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.certifications.name IS 'not_pii: Human-readable name of the certification';

COMMENT ON COLUMN upchieve.certifications.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.certifications.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.certifications.active IS 'not_pii: Whether this certification is currently offered';

COMMENT ON TABLE upchieve.cities IS 'Reference table of US cities';

COMMENT ON COLUMN upchieve.cities.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.cities.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.cities.us_state_code IS 'not_pii: Two-letter US state code';

COMMENT ON COLUMN upchieve.cities.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.cities.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.clever_school_mapping IS 'Mapping of Clever school ids to the school in upchieve.schools';

COMMENT ON COLUMN upchieve.clever_school_mapping.clever_school_id IS 'not_pii: Clever LMS school identifier';

COMMENT ON COLUMN upchieve.clever_school_mapping.upchieve_school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON TABLE upchieve.computed_subject_unlocks IS 'Indicates which certifications unlock which subjects a volunteer can tutor in, when the subject requires multiple certifications';

COMMENT ON COLUMN upchieve.computed_subject_unlocks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.computed_subject_unlocks.certification_id IS 'not_pii: Foreign key to upchieve.certifications';

COMMENT ON COLUMN upchieve.computed_subject_unlocks.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.computed_subject_unlocks.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.contact_form_submissions IS 'Contact form submissions from the website, either before Gleap was implemented or if Gleap is not working';

COMMENT ON COLUMN upchieve.contact_form_submissions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.contact_form_submissions.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.contact_form_submissions.user_email IS 'pii: Email address of the submitting user (may be unauthenticated)';

COMMENT ON COLUMN upchieve.contact_form_submissions.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.contact_form_submissions.topic IS 'not_pii: Contact form topic category';

COMMENT ON COLUMN upchieve.contact_form_submissions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.contact_form_submissions.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.grade_levels IS 'Reference table for grade levels of users';

COMMENT ON COLUMN upchieve.grade_levels.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.grade_levels.name IS 'not_pii: Human-readable name of the grade level';

COMMENT ON COLUMN upchieve.grade_levels.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.grade_levels.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_grade_levels IS 'Join table recording the grade level associated with a user';

COMMENT ON COLUMN upchieve.users_grade_levels.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_grade_levels.signup_grade_level_id IS 'not_pii: Grade level reported at signup; immutable after first set';

COMMENT ON COLUMN upchieve.users_grade_levels.grade_level_id IS 'not_pii: Foreign key to upchieve.grade_levels; represents the last updated student grade level';

COMMENT ON COLUMN upchieve.users_grade_levels.updated_at IS 'not_pii: Timestamp when the record was last updated';

COMMENT ON TABLE upchieve.student_profiles IS 'Profile data for student users';

COMMENT ON COLUMN upchieve.student_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.student_profiles.college IS 'pii: College or university name';

COMMENT ON COLUMN upchieve.student_profiles.school_id IS 'pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.student_profiles.postal_code IS 'pii: US postal/ZIP code';

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_user_id IS 'not_pii: @deprecated';

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs; the student partner org of the student';

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_site_id IS 'not_pii: Foreign key to upchieve.student_partner_org_sites; if applicable, the site of the student partner org for this student';

COMMENT ON COLUMN upchieve.student_profiles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_profiles.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.email_domain_blocklist IS 'Email domains blocked from registering on the platform';

COMMENT ON COLUMN upchieve.email_domain_blocklist.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.email_domain_blocklist.domain IS 'not_pii: Email domain blocked from registration';

COMMENT ON COLUMN upchieve.email_domain_blocklist.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.email_domain_blocklist.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.federated_credentials IS 'OAuth federated identity credentials linking external providers to user accounts';

COMMENT ON COLUMN upchieve.federated_credentials.id IS 'pii: External provider subject identifier (sub claim)';

COMMENT ON COLUMN upchieve.federated_credentials.issuer IS 'not_pii: OAuth 2.0 issuer URL for the federated credential';

COMMENT ON COLUMN upchieve.federated_credentials.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON TABLE upchieve.feedbacks IS '@deprecated - use upchieve.users_surveys; post-session feedback submitted by students and volunteers';

COMMENT ON COLUMN upchieve.feedbacks.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.feedbacks.topic_id IS 'not_pii: Foreign key to upchieve.topics';

COMMENT ON COLUMN upchieve.feedbacks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.feedbacks.user_role_id IS 'not_pii: Foreign key to upchieve.user_roles';

COMMENT ON COLUMN upchieve.feedbacks.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.feedbacks.student_tutoring_feedback IS 'not_pii: JSON feedback from the student about the tutoring session';

COMMENT ON COLUMN upchieve.feedbacks.student_counseling_feedback IS 'not_pii: JSON feedback from the student about counseling';

COMMENT ON COLUMN upchieve.feedbacks.volunteer_feedback IS 'not_pii: JSON feedback from the volunteer about the session';

COMMENT ON COLUMN upchieve.feedbacks.comment IS 'not_pii: Free-text comment provided during feedback';

COMMENT ON COLUMN upchieve.feedbacks.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.feedbacks.legacy_feedbacks IS 'not_pii: Raw feedback data imported from MongoDB';

COMMENT ON COLUMN upchieve.feedbacks.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.feedbacks.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.feedbacks.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.ineligible_students IS 'Records of users who attempted to register but did not meet student eligibility criteria';

COMMENT ON COLUMN upchieve.ineligible_students.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.ineligible_students.email IS 'pii: User email address';

COMMENT ON COLUMN upchieve.ineligible_students.postal_code IS 'pii: US postal/ZIP code';

COMMENT ON COLUMN upchieve.ineligible_students.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';

COMMENT ON COLUMN upchieve.ineligible_students.school_id IS 'pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.ineligible_students.grade_level_id IS 'pii: Foreign key to upchieve.grade_levels';

COMMENT ON COLUMN upchieve.ineligible_students.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.ineligible_students.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.ineligible_students.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.ineligible_students.referred_by IS 'pii: Foreign key to upchieve.users who made the referral';

COMMENT ON TABLE upchieve.ip_addresses IS 'IP addresses observed on the platform, with allow/block status';

COMMENT ON COLUMN upchieve.ip_addresses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.ip_addresses.ip IS 'pii: IPv4 or IPv6 address';

COMMENT ON COLUMN upchieve.ip_addresses.status IS 'not_pii: Status label for the IP address (e.g. allowed, blocked)';

COMMENT ON COLUMN upchieve.ip_addresses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.ip_addresses.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.ip_addresses.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.legacy_availability_histories IS '@deprecated - historical volunteer availability snapshots imported from MongoDB';

COMMENT ON COLUMN upchieve.legacy_availability_histories.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.legacy_availability_histories.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.legacy_availability_histories.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.legacy_availability_histories.timezone IS 'pii: IANA timezone identifier';

COMMENT ON COLUMN upchieve.legacy_availability_histories.recorded_at IS 'not_pii: Timestamp when the availability snapshot was taken';

COMMENT ON COLUMN upchieve.legacy_availability_histories.legacy_availability IS 'not_pii: JSON availability map imported from MongoDB';

COMMENT ON COLUMN upchieve.legacy_availability_histories.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.legacy_availability_histories.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.moderation_actions IS 'Reference table of actions that can be triggered by a moderation rule';

COMMENT ON COLUMN upchieve.moderation_actions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_actions.action_name IS 'not_pii: Name of the moderation action';

COMMENT ON COLUMN upchieve.moderation_actions.description IS 'not_pii: Free-text description';

COMMENT ON TABLE upchieve.moderation_categories IS 'Reference table of content categories used in the moderation system';

COMMENT ON COLUMN upchieve.moderation_categories.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_categories.name IS 'not_pii: Human-readable name';

COMMENT ON TABLE upchieve.moderation_infractions IS 'Records of moderation rule violations committed by a user in a session';

COMMENT ON COLUMN upchieve.moderation_infractions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_infractions.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.moderation_infractions.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.moderation_infractions.reason IS 'not_pii: JSON describing the moderation infraction details';

COMMENT ON COLUMN upchieve.moderation_infractions.active IS 'not_pii: ??';

COMMENT ON COLUMN upchieve.moderation_infractions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.moderation_infractions.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.moderation_penalty_config IS 'Configuration mapping penalty weight ranges to moderation types';

COMMENT ON COLUMN upchieve.moderation_penalty_config.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_penalty_config.min_weight IS 'not_pii: Minimum penalty weight threshold for this config';

COMMENT ON COLUMN upchieve.moderation_penalty_config.max_weight IS 'not_pii: Maximum penalty weight for this config';

COMMENT ON COLUMN upchieve.moderation_penalty_config.moderation_type IS 'not_pii: Moderation system type (contextual or realtime_image)';

COMMENT ON TABLE upchieve.moderation_rule_actions IS 'Join table linking moderation rules to the actions they trigger';

COMMENT ON COLUMN upchieve.moderation_rule_actions.rule_id IS 'not_pii: Foreign key to upchieve.moderation_rules';

COMMENT ON COLUMN upchieve.moderation_rule_actions.action_id IS 'not_pii: Foreign key to upchieve.moderation_actions';

COMMENT ON TABLE upchieve.moderation_rules IS 'Rules that govern automated content moderation on the platform';

COMMENT ON COLUMN upchieve.moderation_rules.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_rules.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.moderation_rules.description IS 'not_pii: Free-text description';

COMMENT ON TABLE upchieve.moderation_rules_flags IS 'Join table linking moderation rules to the session flags they raise';

COMMENT ON COLUMN upchieve.moderation_rules_flags.flag_id IS 'not_pii: Foreign key to upchieve.session_flags';

COMMENT ON COLUMN upchieve.moderation_rules_flags.rule_id IS 'not_pii: Foreign key to upchieve.moderation_rules';

COMMENT ON TABLE upchieve.moderation_settings IS 'Thresholds and penalty weights for the automated content moderation system';

COMMENT ON COLUMN upchieve.moderation_settings.moderation_type IS 'not_pii: Moderation system type (contextual or realtime_image)';

COMMENT ON COLUMN upchieve.moderation_settings.moderation_category_id IS 'not_pii: Foreign key to upchieve.moderation_categories';

COMMENT ON COLUMN upchieve.moderation_settings.threshold IS 'not_pii: Confidence score threshold for triggering moderation';

COMMENT ON COLUMN upchieve.moderation_settings.penalty_weight IS 'not_pii: Penalty weight assigned to this moderation rule';

COMMENT ON TABLE upchieve.muted_users_subject_alerts IS 'Subjects for which a volunteer has muted incoming session request notifications';

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.notification_methods IS 'Reference table of notification delivery methods';

COMMENT ON COLUMN upchieve.notification_methods.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.notification_methods.method IS 'not_pii: Delivery method for the notification (e.g. email, sms, push)';

COMMENT ON COLUMN upchieve.notification_methods.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.notification_methods.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.notification_priority_groups IS 'Reference table of priority tiers for targeting volunteers with session request notifications';

COMMENT ON COLUMN upchieve.notification_priority_groups.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.notification_priority_groups.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.notification_priority_groups.priority IS 'not_pii: Priority level for the notification group';

COMMENT ON COLUMN upchieve.notification_priority_groups.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.notification_priority_groups.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.notification_types IS 'Reference table of notification type for session requests (i.e. initial or followup)';

COMMENT ON COLUMN upchieve.notification_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.notification_types.type IS 'not_pii: Notification type label';

COMMENT ON COLUMN upchieve.notification_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.notification_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.notifications IS 'Log of notifications sent to users';

COMMENT ON COLUMN upchieve.notifications.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.notifications.user_id IS 'not_pii: Foreign key to upchieve.users; who the notification was sent to';

COMMENT ON COLUMN upchieve.notifications.sent_at IS 'not_pii: Timestamp when the notification was sent';

COMMENT ON COLUMN upchieve.notifications.type_id IS 'not_pii: Foreign key to upchieve.notification_types';

COMMENT ON COLUMN upchieve.notifications.method_id IS 'not_pii: Foreign key to upchieve.notification_methods';

COMMENT ON COLUMN upchieve.notifications.priority_group_id IS 'not_pii: Foreign key to upchieve.notification_priority_groups';

COMMENT ON COLUMN upchieve.notifications.successful IS 'not_pii: Whether the notification was successfully delivered';

COMMENT ON COLUMN upchieve.notifications.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.notifications.message_carrier_id IS 'pii: External carrier identifier (e.g. Twilio message SID)';

COMMENT ON COLUMN upchieve.notifications.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.notifications.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.notifications.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.notifications.email_template_id IS 'not_pii: Identifier of the email template used for the notification';

COMMENT ON TABLE upchieve.nths_actions IS 'Reference table of actions that can be recorded for an NTHS group';

COMMENT ON COLUMN upchieve.nths_actions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_actions.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.nths_actions.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.nths_advisors IS 'School advisors who oversee NTHS chapters';

COMMENT ON COLUMN upchieve.nths_advisors.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_advisors.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_advisors.first_name IS 'pii: First name';

COMMENT ON COLUMN upchieve.nths_advisors.last_name IS 'pii: Last name';

COMMENT ON COLUMN upchieve.nths_advisors.email IS 'pii: User email address';

COMMENT ON COLUMN upchieve.nths_advisors.phone IS 'pii: Phone number';

COMMENT ON COLUMN upchieve.nths_advisors.phone_extension IS 'pii: Phone extension for the contact';

COMMENT ON COLUMN upchieve.nths_advisors.title IS 'pii: Professional title of the NTHS advisor';

COMMENT ON COLUMN upchieve.nths_advisors.verified IS 'not_pii: Whether the advisor has been verified';

COMMENT ON COLUMN upchieve.nths_advisors.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_advisors.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_advisors.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON TABLE upchieve.nths_candidate_applications IS 'Applications submitted by students to join an NTHS chapter';

COMMENT ON COLUMN upchieve.nths_candidate_applications.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_candidate_applications.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.nths_candidate_applications.status IS 'not_pii: Application status (applied, approved, or denied)';

COMMENT ON COLUMN upchieve.nths_candidate_applications.denied_notes IS 'pii: Notes explaining why the application was denied';

COMMENT ON COLUMN upchieve.nths_candidate_applications.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_candidate_applications.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.nths_chapter_statuses IS 'Reference table of statuses for an NTHS chapter';

COMMENT ON COLUMN upchieve.nths_chapter_statuses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_chapter_statuses.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.nths_chapter_statuses.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.nths_chapters_statuses IS 'Join table tracking the current and historical statuses of NTHS chapters';

COMMENT ON COLUMN upchieve.nths_chapters_statuses.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_chapters_statuses.nths_chapter_status_id IS 'not_pii: Foreign key to upchieve.nths_chapter_statuses';

COMMENT ON COLUMN upchieve.nths_chapters_statuses.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.nths_group_actions IS 'Records of actions that have been completed by an NTHS group';

COMMENT ON COLUMN upchieve.nths_group_actions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_group_actions.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_actions.nths_action_id IS 'not_pii: Foreign key to upchieve.nths_actions';

COMMENT ON COLUMN upchieve.nths_group_actions.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.nths_group_member_roles IS 'Roles assigned to members within an NTHS group';

COMMENT ON COLUMN upchieve.nths_group_member_roles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.nths_group_member_roles.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_member_roles.role_id IS 'not_pii: Foreign key to upchieve.nths_group_roles';

COMMENT ON COLUMN upchieve.nths_group_member_roles.updated_at IS 'not_pii: Timestamp when the record was last updated';

COMMENT ON TABLE upchieve.nths_group_members IS 'Users who are members of an NTHS group';

COMMENT ON COLUMN upchieve.nths_group_members.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_members.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.nths_group_members.title IS 'not_pii: Title of the user in the NTHS group';

COMMENT ON COLUMN upchieve.nths_group_members.joined_at IS 'not_pii: Timestamp when the member joined the group';

COMMENT ON COLUMN upchieve.nths_group_members.updated_at IS 'not_pii: Timestamp when the record was last updated';

COMMENT ON COLUMN upchieve.nths_group_members.deactivated_at IS 'not_pii: Timestamp when the membership was deactivated';

COMMENT ON TABLE upchieve.nths_group_roles IS 'Reference table of roles a member can hold within an NTHS group';

COMMENT ON COLUMN upchieve.nths_group_roles.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_group_roles.name IS 'not_pii: Human-readable name';

COMMENT ON TABLE upchieve.nths_group_school_affiliation IS 'Association between an NTHS group and a school';

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.nths_school_affiliation_status_id IS 'not_pii: Foreign key to upchieve.nths_school_affiliation_statuses';

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON TABLE upchieve.nths_groups IS 'NTHS (National Technical Honor Society) chapters on the platform';

COMMENT ON COLUMN upchieve.nths_groups.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_groups.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.nths_groups.key IS 'not_pii: Unique URL-safe slug';

COMMENT ON COLUMN upchieve.nths_groups.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_groups.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_groups.invite_code IS 'not_pii: Short invite code for joining the NTHS group';

COMMENT ON TABLE upchieve.nths_school_affiliation_statuses IS 'Reference table of statuses for an NTHS chapter''s school affiliation';

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.parents_guardians IS 'Parent or guardian contacts associated with student accounts';

COMMENT ON COLUMN upchieve.parents_guardians.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.parents_guardians.email IS 'pii: Parent/guardian email address';

COMMENT ON COLUMN upchieve.parents_guardians.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.parents_guardians.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.parents_guardians_students IS 'Join table linking parents or guardians to their students';

COMMENT ON COLUMN upchieve.parents_guardians_students.parents_guardians_id IS 'not_pii: Foreign key to upchieve.parents_guardians';

COMMENT ON COLUMN upchieve.parents_guardians_students.students_id IS 'not_pii: Foreign key to upchieve.users (the student)';

COMMENT ON TABLE upchieve.photo_id_statuses IS 'Reference table of statuses for a volunteer''s photo ID review';

COMMENT ON COLUMN upchieve.photo_id_statuses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.photo_id_statuses.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.photo_id_statuses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.photo_id_statuses.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.postal_codes IS 'US zip codes with income and geographic data used to determine student eligibility';

COMMENT ON COLUMN upchieve.postal_codes.code IS 'not_pii: The US zipcode';

COMMENT ON COLUMN upchieve.postal_codes.us_state_code IS 'not_pii: Two-letter US state code';

COMMENT ON COLUMN upchieve.postal_codes.income IS 'not_pii: Median household income for the postal code area';

COMMENT ON COLUMN upchieve.postal_codes.location IS 'not_pii: Geographic point coordinates of the postal code centroid';

COMMENT ON COLUMN upchieve.postal_codes.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.postal_codes.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.postal_codes.cbsa_income IS 'not_pii: Median income for the Core Based Statistical Area';

COMMENT ON COLUMN upchieve.postal_codes.state_income IS 'not_pii: Median income for the state';

COMMENT ON TABLE upchieve.pre_session_surveys IS '@deprecated - use upchieve.users_surveys; legacy student surveys completed before a tutoring session begins';

COMMENT ON COLUMN upchieve.pre_session_surveys.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.pre_session_surveys.response_data IS 'not_pii: JSON blob of survey response data';

COMMENT ON COLUMN upchieve.pre_session_surveys.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.pre_session_surveys.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.pre_session_surveys.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.pre_session_surveys.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.pre_session_surveys.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.progress_report_analysis_types IS 'Reference table of analysis types used in progress report generation';

COMMENT ON COLUMN upchieve.progress_report_analysis_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_analysis_types.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.progress_report_analysis_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_analysis_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_concept_details IS 'AI-generated detail content for individual concepts within a progress report';

COMMENT ON COLUMN upchieve.progress_report_concept_details.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_concept_details.content IS 'not_pii: AI-generated detail text (may contain student context)';

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_concept_id IS 'not_pii: Foreign key to upchieve.progress_report_concepts';

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_focus_area_id IS 'not_pii: Foreign key to upchieve.progress_report_focus_areas';

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_info_type_id IS 'not_pii: Foreign key to upchieve.progress_report_info_types';

COMMENT ON COLUMN upchieve.progress_report_concept_details.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_concept_details.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_concepts IS 'Individual academic concepts identified and graded in a student progress report';

COMMENT ON COLUMN upchieve.progress_report_concepts.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_concepts.name IS 'not_pii: Name of the academic concept covered in the report';

COMMENT ON COLUMN upchieve.progress_report_concepts.description IS 'not_pii: AI-generated description of the concept (may contain student context)';

COMMENT ON COLUMN upchieve.progress_report_concepts.grade IS 'not_pii: Numeric performance grade (percentage)';

COMMENT ON COLUMN upchieve.progress_report_concepts.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';

COMMENT ON COLUMN upchieve.progress_report_concepts.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_concepts.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_focus_areas IS 'Reference table of focus areas in progress reports (e.g. strengths, areas to improve)';

COMMENT ON COLUMN upchieve.progress_report_focus_areas.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_focus_areas.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.progress_report_focus_areas.display_name IS 'not_pii: User-facing display name';

COMMENT ON COLUMN upchieve.progress_report_focus_areas.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_focus_areas.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_info_types IS 'Reference table of information types within progress report details (e.g. tips, explanations)';

COMMENT ON COLUMN upchieve.progress_report_info_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_info_types.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.progress_report_info_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_info_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_prompts IS 'AI prompts used to generate student progress reports';

COMMENT ON COLUMN upchieve.progress_report_prompts.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_prompts.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.progress_report_prompts.prompt IS 'not_pii: Prompt text sent to the AI model';

COMMENT ON COLUMN upchieve.progress_report_prompts.active IS 'not_pii: Whether the record is currently active';

COMMENT ON COLUMN upchieve.progress_report_prompts.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_prompts.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_sessions IS 'Sessions included in the analysis for a given progress report';

COMMENT ON COLUMN upchieve.progress_report_sessions.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';

COMMENT ON COLUMN upchieve.progress_report_sessions.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.progress_report_sessions.progress_report_analysis_type_id IS 'not_pii: Foreign key to upchieve.progress_report_analysis_types';

COMMENT ON COLUMN upchieve.progress_report_sessions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_sessions.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_statuses IS 'Reference table of statuses for a progress report (e.g. pending, complete, error)';

COMMENT ON COLUMN upchieve.progress_report_statuses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_statuses.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.progress_report_statuses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_statuses.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_summaries IS 'AI-generated overall summaries for student progress reports';

COMMENT ON COLUMN upchieve.progress_report_summaries.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_summaries.summary IS 'not_pii: AI-generated summary text (may contain student context)';

COMMENT ON COLUMN upchieve.progress_report_summaries.overall_grade IS 'not_pii: Aggregate percentage performance grade';

COMMENT ON COLUMN upchieve.progress_report_summaries.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';

COMMENT ON COLUMN upchieve.progress_report_summaries.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_summaries.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_report_summary_details IS 'AI-generated detail content for sections of a progress report summary';

COMMENT ON COLUMN upchieve.progress_report_summary_details.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_report_summary_details.content IS 'not_pii: AI-generated summary detail text (may contain student context)';

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_summary_id IS 'not_pii: Foreign key to upchieve.progress_report_summaries';

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_focus_area_id IS 'not_pii: Foreign key to upchieve.progress_report_focus_areas';

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_info_type_id IS 'not_pii: Foreign key to upchieve.progress_report_info_types';

COMMENT ON COLUMN upchieve.progress_report_summary_details.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_report_summary_details.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.progress_reports IS 'AI-generated reports on a student''s academic progress across recent sessions';

COMMENT ON COLUMN upchieve.progress_reports.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.progress_reports.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.progress_reports.status_id IS 'not_pii: Foreign key to upchieve.progress_report_statuses';

COMMENT ON COLUMN upchieve.progress_reports.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_reports.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.progress_reports.read_at IS 'not_pii: Timestamp when the user first read the report';

COMMENT ON COLUMN upchieve.progress_reports.prompt_id IS 'not_pii: Foreign key to upchieve.progress_report_prompts';

COMMENT ON TABLE upchieve.push_tokens IS 'Mobile device push notification tokens registered by users';

COMMENT ON COLUMN upchieve.push_tokens.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.push_tokens.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.push_tokens.token IS 'pii: Push notification device token';

COMMENT ON COLUMN upchieve.push_tokens.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.push_tokens.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.question_tags IS '@deprecated? It''s an empty table';

COMMENT ON COLUMN upchieve.question_tags.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.question_tags.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.question_tags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.question_tags.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.question_types IS 'Reference table of question types used in surveys (e.g. multiple choice, rating)';

COMMENT ON COLUMN upchieve.question_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.question_types.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.question_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.question_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.quiz_certification_grants IS 'Join table mapping quizzes to the certifications they grant to volunteers upon passing';

COMMENT ON COLUMN upchieve.quiz_certification_grants.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';

COMMENT ON COLUMN upchieve.quiz_certification_grants.certification_id IS 'not_pii: Foreign key to upchieve.certifications';

COMMENT ON COLUMN upchieve.quiz_certification_grants.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quiz_certification_grants.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.quiz_questions IS 'Questions used in volunteer certification quizzes';

COMMENT ON COLUMN upchieve.quiz_questions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.quiz_questions.question_text IS 'not_pii: Text of the quiz question';

COMMENT ON COLUMN upchieve.quiz_questions.possible_answers IS 'not_pii: JSON array of possible answer options';

COMMENT ON COLUMN upchieve.quiz_questions.correct_answer IS 'not_pii: The correct answer text';

COMMENT ON COLUMN upchieve.quiz_questions.quiz_subcategory_id IS 'not_pii: Foreign key to upchieve.quiz_subcategories';

COMMENT ON COLUMN upchieve.quiz_questions.image_source IS 'not_pii: URL or path to an image associated with the quiz question';

COMMENT ON COLUMN upchieve.quiz_questions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quiz_questions.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quiz_questions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.quiz_review_materials IS 'Study materials provided to help volunteers prepare for a certification quiz';

COMMENT ON COLUMN upchieve.quiz_review_materials.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.quiz_review_materials.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';

COMMENT ON COLUMN upchieve.quiz_review_materials.title IS 'not_pii: Title of the record';

COMMENT ON COLUMN upchieve.quiz_review_materials.pdf IS 'not_pii: URL or path to the review material PDF';

COMMENT ON COLUMN upchieve.quiz_review_materials.image IS 'not_pii: URL or path to the review material cover image';

COMMENT ON COLUMN upchieve.quiz_review_materials.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quiz_review_materials.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.quiz_subcategories IS 'Subcategories that organize questions within a certification quiz';

COMMENT ON COLUMN upchieve.quiz_subcategories.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.quiz_subcategories.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.quiz_subcategories.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';

COMMENT ON COLUMN upchieve.quiz_subcategories.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quiz_subcategories.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.quizzes IS 'Certification quizzes volunteers take to unlock the ability to tutor specific subjects';

COMMENT ON COLUMN upchieve.quizzes.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.quizzes.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.quizzes.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quizzes.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.quizzes.active IS 'not_pii: Whether this quiz is currently available to volunteers';

COMMENT ON COLUMN upchieve.quizzes.questions_per_subcategory IS 'not_pii: Number of questions drawn per subcategory per quiz attempt';

COMMENT ON TABLE upchieve.referrals IS 'Records of users who referred other users to the platform';

COMMENT ON COLUMN upchieve.referrals.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.referrals.referred_by IS 'not_pii: Foreign key to upchieve.users who made the referral';

COMMENT ON COLUMN upchieve.referrals.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON TABLE upchieve.report_reasons IS 'Reference table of reasons a session or user can be reported';

COMMENT ON COLUMN upchieve.report_reasons.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.report_reasons.reason IS 'not_pii: Reason for the action (text or JSON)';

COMMENT ON COLUMN upchieve.report_reasons.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.report_reasons.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.required_email_domains IS 'Email domains required for volunteers registering with a specific volunteer partner org';

COMMENT ON COLUMN upchieve.required_email_domains.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.required_email_domains.domain IS 'not_pii: Domain name (e.g. example.com)';

COMMENT ON COLUMN upchieve.required_email_domains.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.required_email_domains.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.required_email_domains.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.school_nces_metadata IS 'NCES (National Center for Education Statistics) data for schools, used to determine student eligibility';

COMMENT ON COLUMN upchieve.school_nces_metadata.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.school_nces_metadata.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.school_nces_metadata.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.school_nces_metadata.school_year IS 'not_pii: NCES school year label';

COMMENT ON COLUMN upchieve.school_nces_metadata.st IS 'not_pii: NCES state abbreviation';

COMMENT ON COLUMN upchieve.school_nces_metadata.sch_name IS 'not_pii: NCES school name';

COMMENT ON COLUMN upchieve.school_nces_metadata.lea_name IS 'not_pii: NCES district name';

COMMENT ON COLUMN upchieve.school_nces_metadata.leaid IS 'not_pii: NCES district id';

COMMENT ON COLUMN upchieve.school_nces_metadata.ncessch IS 'not_pii: NCES school id';

COMMENT ON COLUMN upchieve.school_nces_metadata.mcity IS 'not_pii: NCES mailing city';

COMMENT ON COLUMN upchieve.school_nces_metadata.mzip IS 'not_pii: NCES mailing ZIP code';

COMMENT ON COLUMN upchieve.school_nces_metadata.lcity IS 'not_pii: NCES location city';

COMMENT ON COLUMN upchieve.school_nces_metadata.lzip IS 'not_pii: NCES location ZIP code';

COMMENT ON COLUMN upchieve.school_nces_metadata.gslo IS 'not_pii: Lowest grade served by the school';

COMMENT ON COLUMN upchieve.school_nces_metadata.gshi IS 'not_pii: Highest grade served by the school';

COMMENT ON COLUMN upchieve.school_nces_metadata.is_school_wide_title1 IS 'not_pii: Whether the school participates in school-wide Title I';

COMMENT ON COLUMN upchieve.school_nces_metadata.is_title1_eligible IS 'not_pii: Whether the school is Title I eligible';

COMMENT ON COLUMN upchieve.school_nces_metadata.national_school_lunch_program IS 'not_pii: National School Lunch Program participation status';

COMMENT ON COLUMN upchieve.school_nces_metadata.total_students IS 'not_pii: Total student enrollment';

COMMENT ON COLUMN upchieve.school_nces_metadata.nslp_direct_certification IS 'not_pii: Number of students directly certified for National School Lunch Program';

COMMENT ON COLUMN upchieve.school_nces_metadata.frl_eligible IS 'not_pii: Number of students eligible for free or reduced-price lunch';

COMMENT ON COLUMN upchieve.school_nces_metadata.title1_school_status IS 'not_pii: Title I school status label';

COMMENT ON TABLE upchieve.schools IS 'Schools associated with students and teachers on the platform';

COMMENT ON COLUMN upchieve.schools.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.schools.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.schools.approved IS 'not_pii: Whether the school has been approved for use on the platform';

COMMENT ON COLUMN upchieve.schools.partner IS 'not_pii: Whether the school is an official UPchieve partner school';

COMMENT ON COLUMN upchieve.schools.city_id IS 'not_pii: Foreign key to upchieve.cities';

COMMENT ON COLUMN upchieve.schools.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.schools.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.schools.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.schools.legacy_city_name IS 'not_pii: @deprecated - city name imported from MongoDB before the cities table existed';

COMMENT ON TABLE upchieve.schools_sponsor_orgs IS 'Current associations between schools and the sponsor orgs that support them';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.schools_sponsor_orgs_instances IS 'Represents active/deactivated status of a school''s association with a sponsor org';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_audio IS 'Tutoring sessions that used audio';

COMMENT ON COLUMN upchieve.session_audio.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_audio.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_audio.resource_uri IS 'not_pii: ?? The column is always null, theoretically a link to the resource in cloud storage';

COMMENT ON COLUMN upchieve.session_audio.student_joined_at IS 'not_pii: Timestamp when the student joined the audio session';

COMMENT ON COLUMN upchieve.session_audio.volunteer_joined_at IS 'not_pii: Timestamp when the volunteer joined the session';

COMMENT ON COLUMN upchieve.session_audio.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_audio.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_audio_transcript_messages IS 'Transcribed messages from session audio recordings';

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.said_at IS 'not_pii: Timestamp when the audio transcript message was spoken';

COMMENT ON TABLE upchieve.session_failed_joins IS 'Records of users who attempted but failed to join a session';

COMMENT ON COLUMN upchieve.session_failed_joins.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_failed_joins.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.session_failed_joins.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_failed_joins.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_flags IS 'Reference table of flags that can be raised on a session';

COMMENT ON COLUMN upchieve.session_flags.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_flags.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.session_flags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_flags.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_meetings IS 'External audio/screenshare meeting records associated with sessions';

COMMENT ON COLUMN upchieve.session_meetings.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_meetings.external_id IS 'not_pii: External meeting provider identifier';

COMMENT ON COLUMN upchieve.session_meetings.provider IS 'not_pii: Audio/screenshare meeting provider name';

COMMENT ON COLUMN upchieve.session_meetings.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_meetings.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_meetings.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_meetings.recording_id IS 'not_pii: External identifier for the meeting recording';

COMMENT ON TABLE upchieve.session_messages IS 'Chat messages sent by participants during a tutoring session';

COMMENT ON COLUMN upchieve.session_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';

COMMENT ON COLUMN upchieve.session_messages.contents IS 'not_pii: Text content of the chat message';

COMMENT ON COLUMN upchieve.session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_messages.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_messages.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_messages.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON TABLE upchieve.session_photos IS 'Photos uploaded by participants during a tutoring session';

COMMENT ON COLUMN upchieve.session_photos.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_photos.photo_key IS 'pii: Object key for a session photo';

COMMENT ON COLUMN upchieve.session_photos.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_photos.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_reports IS 'Reports filed by users about inappropriate or concerning behaviour in a session';

COMMENT ON COLUMN upchieve.session_reports.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_reports.report_reason_id IS 'not_pii: Foreign key to upchieve.report_reasons';

COMMENT ON COLUMN upchieve.session_reports.report_message IS 'not_pii: Free-text message submitted with the report (may contain user content)';

COMMENT ON COLUMN upchieve.session_reports.reporting_user_id IS 'not_pii: Foreign key to upchieve.users who filed the report';

COMMENT ON COLUMN upchieve.session_reports.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_reports.reported_user_id IS 'not_pii: Foreign key to upchieve.users who was reported';

COMMENT ON COLUMN upchieve.session_reports.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_reports.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_review_reasons IS 'Flags that caused a session to be queued for admin review';

COMMENT ON COLUMN upchieve.session_review_reasons.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_review_reasons.session_flag_id IS 'not_pii: Foreign key to upchieve.session_flags';

COMMENT ON COLUMN upchieve.session_review_reasons.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_review_reasons.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.session_summaries IS 'AI-generated summaries of a completed session';

COMMENT ON COLUMN upchieve.session_summaries.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_summaries.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_summaries.summary IS 'not_pii: AI-generated summary text';

COMMENT ON COLUMN upchieve.session_summaries.user_type_id IS 'not_pii: Foreign key to upchieve.user_roles; who the session summary is being generated for';

COMMENT ON COLUMN upchieve.session_summaries.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_summaries.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_summaries.trace_id IS 'not_pii: Tracing ID for the AI summary generation request, used for user to provide feedback on the summary';

COMMENT ON TABLE upchieve.session_voice_messages IS 'Voice messages sent by participants during a tutoring session';

COMMENT ON COLUMN upchieve.session_voice_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_voice_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_voice_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';

COMMENT ON COLUMN upchieve.session_voice_messages.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_voice_messages.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.session_voice_messages.transcript IS 'not_pii: Text transcript of the voice message';

COMMENT ON TABLE upchieve.sessions IS 'Tutoring sessions between a student and a volunteer';

COMMENT ON COLUMN upchieve.sessions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.sessions.student_id IS 'not_pii: Foreign key to upchieve.users (the student)';

COMMENT ON COLUMN upchieve.sessions.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';

COMMENT ON COLUMN upchieve.sessions.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.sessions.has_whiteboard_doc IS 'not_pii: Whether the session has an associated whiteboard document';

COMMENT ON COLUMN upchieve.sessions.quill_doc IS 'not_pii: Quill.js shared document content (user-generated text)';

COMMENT ON COLUMN upchieve.sessions.volunteer_joined_at IS 'not_pii: Timestamp when the volunteer joined the session';

COMMENT ON COLUMN upchieve.sessions.ended_at IS 'not_pii: Timestamp when the session ended';

COMMENT ON COLUMN upchieve.sessions.reviewed IS 'not_pii: Whether the session has been reviewed by an admin';

COMMENT ON COLUMN upchieve.sessions.to_review IS 'not_pii: Whether the session has been flagged for admin review';

COMMENT ON COLUMN upchieve.sessions.student_banned IS 'not_pii: Whether the student was banned as a result of this session';

COMMENT ON COLUMN upchieve.sessions.time_tutored IS 'not_pii: Duration of active tutoring in milliseconds';

COMMENT ON COLUMN upchieve.sessions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sessions.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sessions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.sessions.shadowbanned IS 'not_pii: Whether the student was shadow banned when requesting the session';

COMMENT ON COLUMN upchieve.sessions.ended_by_user_id IS 'not_pii: Foreign key to upchieve.users who ended the session';

COMMENT ON TABLE upchieve.sessions_session_flags IS 'Join table associating active session flags with a session';

COMMENT ON COLUMN upchieve.sessions_session_flags.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.sessions_session_flags.session_flag_id IS 'not_pii: Foreign key to upchieve.session_flags';

COMMENT ON COLUMN upchieve.sessions_session_flags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sessions_session_flags.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.sessions_students_assignments IS 'Join table linking sessions to the student assignments they help fulfill';

COMMENT ON COLUMN upchieve.sessions_students_assignments.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.sessions_students_assignments.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.sessions_students_assignments.assignment_id IS 'not_pii: Foreign key to upchieve.assignments';

COMMENT ON COLUMN upchieve.sessions_students_assignments.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sessions_students_assignments.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.shareable_domains IS 'Domains of websites permitted to be shared in sessions';

COMMENT ON COLUMN upchieve.shareable_domains.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.shareable_domains.domain IS 'not_pii: Domain allowed in session links';

COMMENT ON COLUMN upchieve.shareable_domains.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.shareable_domains.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.signup_sources IS 'Reference table of channels through which users discovered the platform';

COMMENT ON COLUMN upchieve.signup_sources.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.signup_sources.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.signup_sources.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.signup_sources.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.sponsor_orgs IS 'Organizations that fund or sponsor student access to the platform';

COMMENT ON COLUMN upchieve.sponsor_orgs.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.sponsor_orgs.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.sponsor_orgs.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sponsor_orgs.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sponsor_orgs.key IS 'not_pii: Unique URL-safe slug';

COMMENT ON TABLE upchieve.sponsor_orgs_upchieve_instances IS 'Represents active/deactivated status of a sponsor orgs';

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances IS 'Represents active/deactivated status of associations between sponsor orgs and volunteer partner orgs';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_classes IS 'Join table enrolling students in a teacher''s class';

COMMENT ON COLUMN upchieve.student_classes.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.student_classes.class_id IS 'not_pii: Foreign key to upchieve.teacher_classes';

COMMENT ON COLUMN upchieve.student_classes.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_classes.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_favorite_volunteers IS 'Volunteers that a student has marked as favourites';

COMMENT ON COLUMN upchieve.student_favorite_volunteers.student_id IS 'not_pii: Foreign key to upchieve.users (the student)';

COMMENT ON COLUMN upchieve.student_favorite_volunteers.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';

COMMENT ON COLUMN upchieve.student_favorite_volunteers.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_favorite_volunteers.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_partner_org_sites IS 'Physical or programmatic sites within a student partner organization';

COMMENT ON COLUMN upchieve.student_partner_org_sites.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.student_partner_org_sites.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.student_partner_org_sites.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_org_sites.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_org_sites.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_partner_orgs IS 'Student partner organizations partner with UPchieve to give access to their students';

COMMENT ON COLUMN upchieve.student_partner_orgs.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.student_partner_orgs.key IS 'not_pii: Unique URL-safe slug';

COMMENT ON COLUMN upchieve.student_partner_orgs.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.student_partner_orgs.signup_code IS 'not_pii: Invite code required to register with this partner org';

COMMENT ON COLUMN upchieve.student_partner_orgs.high_school_signup IS 'not_pii: Whether high school students may register with this org';

COMMENT ON COLUMN upchieve.student_partner_orgs.college_signup IS 'not_pii: Whether college students may register with this org';

COMMENT ON COLUMN upchieve.student_partner_orgs.school_signup_required IS 'not_pii: Whether students must select a school during registration';

COMMENT ON COLUMN upchieve.student_partner_orgs.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON TABLE upchieve.student_partner_orgs_sponsor_orgs IS '@deprecated? Use upchieve.student_partner_orgs_sponsor_orgs_instances; Represents associations between student partner orgs and sponsor orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_partner_orgs_sponsor_orgs_instances IS 'Represents active/deactivated status of associations between a student partner org and sponsor org';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_partner_orgs_upchieve_instances IS 'Represents active/deactivated status of a student partner orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.student_partner_orgs_volunteer_partner_orgs_instances IS '???';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.students_assignments IS 'Join table tracking student assignment submissions and completion';

COMMENT ON COLUMN upchieve.students_assignments.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.students_assignments.assignment_id IS 'not_pii: Foreign key to upchieve.assignments';

COMMENT ON COLUMN upchieve.students_assignments.submitted_at IS 'not_pii: Timestamp when the student submitted the assignment';

COMMENT ON COLUMN upchieve.students_assignments.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.students_assignments.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.subjects IS 'Tutoring subjects available on the platform';

COMMENT ON COLUMN upchieve.subjects.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.subjects.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.subjects.display_name IS 'not_pii: User-facing display name';

COMMENT ON COLUMN upchieve.subjects.display_order IS 'not_pii: Sort order for UI display';

COMMENT ON COLUMN upchieve.subjects.topic_id IS 'not_pii: Foreign key to upchieve.topics';

COMMENT ON COLUMN upchieve.subjects.tool_type_id IS 'not_pii: Foreign key to upchieve.tool_types';

COMMENT ON COLUMN upchieve.subjects.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.subjects.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.subjects.active IS 'not_pii: Whether the subject is currently active';

COMMENT ON TABLE upchieve.survey_questions IS 'Questions used in surveys';

COMMENT ON COLUMN upchieve.survey_questions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.survey_questions.question_type_id IS 'not_pii: Foreign key to upchieve.question_types';

COMMENT ON COLUMN upchieve.survey_questions.question_text IS 'not_pii: Text of the quiz question';

COMMENT ON COLUMN upchieve.survey_questions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_questions.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_questions.response_display_text IS 'not_pii: Text shown alongside the response in reporting views';

COMMENT ON COLUMN upchieve.survey_questions.replacement_column_1 IS 'not_pii: First dynamic replacement value for question text templating';

COMMENT ON COLUMN upchieve.survey_questions.replacement_column_2 IS 'not_pii: Second dynamic replacement value for question text templating';

COMMENT ON TABLE upchieve.survey_questions_question_tags IS '@deprecated? Just an empty table';

COMMENT ON COLUMN upchieve.survey_questions_question_tags.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.survey_questions_question_tags.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';

COMMENT ON COLUMN upchieve.survey_questions_question_tags.question_tag_id IS 'not_pii: Foreign key to upchieve.question_tags';

COMMENT ON COLUMN upchieve.survey_questions_question_tags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_questions_question_tags.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.survey_questions_response_choices IS 'Join table linking survey questions to their available response options';

COMMENT ON COLUMN upchieve.survey_questions_response_choices.response_choice_id IS 'not_pii: Foreign key to upchieve.survey_response_choices';

COMMENT ON COLUMN upchieve.survey_questions_response_choices.display_priority IS 'not_pii: Sort order for display in the UI';

COMMENT ON COLUMN upchieve.survey_questions_response_choices.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_questions_response_choices.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_questions_response_choices.surveys_survey_question_id IS 'not_pii: Foreign key to upchieve.surveys_survey_questions';

COMMENT ON TABLE upchieve.survey_response_choices IS 'Response choices available for survey questions';

COMMENT ON COLUMN upchieve.survey_response_choices.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.survey_response_choices.score IS 'not_pii: Numeric score for the survey response choice';

COMMENT ON COLUMN upchieve.survey_response_choices.choice_text IS 'not_pii: Display text for the survey response choice';

COMMENT ON COLUMN upchieve.survey_response_choices.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_response_choices.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_response_choices.display_image IS 'not_pii: URL or path to an image displayed alongside the choice';

COMMENT ON TABLE upchieve.survey_types IS 'Reference table of survey types (e.g. pre-session, post-session, progress report)';

COMMENT ON COLUMN upchieve.survey_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.survey_types.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.survey_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.survey_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.surveys IS 'Surveys administered to users on the platform';

COMMENT ON COLUMN upchieve.surveys.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.surveys.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.surveys.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.surveys.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.surveys.role_id IS 'not_pii: Foreign key to upchieve.user_roles';

COMMENT ON COLUMN upchieve.surveys.reward_amount IS 'not_pii: Gift card reward in cents for completing the survey';

COMMENT ON TABLE upchieve.surveys_context IS 'Defines which surveys apply to which subjects and survey types';

COMMENT ON COLUMN upchieve.surveys_context.survey_id IS 'not_pii: Foreign key to upchieve.surveys';

COMMENT ON COLUMN upchieve.surveys_context.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON COLUMN upchieve.surveys_context.survey_type_id IS 'not_pii: Foreign key to upchieve.survey_types';

COMMENT ON COLUMN upchieve.surveys_context.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.surveys_context.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.surveys_survey_questions IS 'Join table ordering questions within a survey';

COMMENT ON COLUMN upchieve.surveys_survey_questions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.surveys_survey_questions.survey_id IS 'not_pii: Foreign key to upchieve.surveys';

COMMENT ON COLUMN upchieve.surveys_survey_questions.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';

COMMENT ON COLUMN upchieve.surveys_survey_questions.display_priority IS 'not_pii: Sort order for display in the UI';

COMMENT ON COLUMN upchieve.surveys_survey_questions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.surveys_survey_questions.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.teacher_classes IS 'Classes created by teachers for enrolling their students';

COMMENT ON COLUMN upchieve.teacher_classes.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.teacher_classes.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.teacher_classes.name IS 'not_pii: Name of the teacher class';

COMMENT ON COLUMN upchieve.teacher_classes.code IS 'not_pii: Student-facing join code for the teacher class';

COMMENT ON COLUMN upchieve.teacher_classes.active IS 'not_pii: Whether the class is currently active';

COMMENT ON COLUMN upchieve.teacher_classes.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.teacher_classes.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.teacher_classes.topic_id IS 'not_pii: Foreign key to upchieve.topics';

COMMENT ON COLUMN upchieve.teacher_classes.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.teacher_classes.clever_id IS 'not_pii: Clever LMS class identifier';

COMMENT ON TABLE upchieve.teacher_profiles IS 'Profile data for teacher users';

COMMENT ON COLUMN upchieve.teacher_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.teacher_profiles.school_id IS 'pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.teacher_profiles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.teacher_profiles.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.teacher_profiles.last_successful_clever_sync IS 'not_pii: Timestamp of the most recent successful Clever data sync';

COMMENT ON TABLE upchieve.text_moderation_patterns IS 'Regex patterns used for automated text content moderation';

COMMENT ON COLUMN upchieve.text_moderation_patterns.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.text_moderation_patterns.regex IS 'not_pii: Regular expression pattern used for text moderation matching';

COMMENT ON COLUMN upchieve.text_moderation_patterns.flags IS 'not_pii: Regex flags applied to the pattern (e.g. i for case-insensitive)';

COMMENT ON COLUMN upchieve.text_moderation_patterns.rules IS 'not_pii: JSON moderation rules associated with this pattern';

COMMENT ON COLUMN upchieve.text_moderation_patterns.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.text_moderation_patterns.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.tool_types IS 'Reference table of session tools available during tutoring (e.g. whiteboard, document editor)';

COMMENT ON COLUMN upchieve.tool_types.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.tool_types.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.tool_types.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.tool_types.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.topics IS 'Subject topic areas that group related tutoring subjects (e.g. Math, College Counseling)';

COMMENT ON COLUMN upchieve.topics.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.topics.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.topics.icon_link IS 'not_pii: URL to the topic icon image';

COMMENT ON COLUMN upchieve.topics.color IS 'not_pii: Hex color code associated with the topic';

COMMENT ON COLUMN upchieve.topics.dashboard_order IS 'not_pii: Sort order on the student subject dashboard';

COMMENT ON COLUMN upchieve.topics.display_name IS 'not_pii: User-facing display name';

COMMENT ON COLUMN upchieve.topics.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.topics.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.topics.training_order IS 'not_pii: Sort order in the volunteer training flow';

COMMENT ON TABLE upchieve.totp IS 'TOTP two-factor authentication secrets and state for users';

COMMENT ON COLUMN upchieve.totp.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.totp.secret IS 'pii: Encrypted TOTP shared secret used for two-factor authentication';

COMMENT ON COLUMN upchieve.totp.verified IS 'not_pii: Whether the TOTP authenticator has been verified by the user';

COMMENT ON COLUMN upchieve.totp.last_used_counter IS 'not_pii: TOTP counter value from the most recent successful authentication';

COMMENT ON COLUMN upchieve.totp.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.totp.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.training_courses IS 'Onboarding training courses that volunteers complete before they can tutor';

COMMENT ON COLUMN upchieve.training_courses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.training_courses.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.training_courses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.training_courses.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.training_courses.display_name IS 'not_pii: User-facing display name';

COMMENT ON TABLE upchieve.tutor_bot_conversation_messages IS 'Messages in a AI tutor bot conversation';

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.tutor_bot_conversation_id IS 'not_pii: Foreign key to upchieve.tutor_bot_conversations';

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.sender_user_type IS 'not_pii: Role of the message sender (student, bot, or volunteer)';

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.tutor_bot_conversations IS 'AI tutor bot conversations';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.tutor_bot_conversations.subject_id IS 'not_pii: Foreign key to upchieve.subjects';

COMMENT ON TABLE upchieve.tutor_bot_session_messages IS 'Messages exchanged between a user and the AI tutor bot during a live session';

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.tutor_bot_session_user_type IS 'not_pii: Whether the message was sent by the student or the bot';

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.created_at IS 'not_pii';

COMMENT ON TABLE upchieve.us_states IS 'Reference table of US states';

COMMENT ON COLUMN upchieve.us_states.code IS 'not_pii: Two-letter US state abbreviation (primary key)';

COMMENT ON COLUMN upchieve.us_states.name IS 'not_pii: Full name of the US state';

COMMENT ON COLUMN upchieve.us_states.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.us_states.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.user_actions IS 'Audit log of notable events and actions taken by users on the platform';

COMMENT ON COLUMN upchieve.user_actions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.user_actions.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.user_actions.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.user_actions.action_type IS 'not_pii: Category of the user action (e.g. account, session)';

COMMENT ON COLUMN upchieve.user_actions.action IS 'not_pii: Specific action label';

COMMENT ON COLUMN upchieve.user_actions.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';

COMMENT ON COLUMN upchieve.user_actions.device IS 'pii: Device type parsed from the user agent string';

COMMENT ON COLUMN upchieve.user_actions.browser IS 'pii: Browser name parsed from the user agent string';

COMMENT ON COLUMN upchieve.user_actions.browser_version IS 'pii: Browser version string';

COMMENT ON COLUMN upchieve.user_actions.operating_system IS 'pii: Operating system name';

COMMENT ON COLUMN upchieve.user_actions.operating_system_version IS 'pii: Operating system version string';

COMMENT ON COLUMN upchieve.user_actions.quiz_subcategory IS 'not_pii: Quiz subcategory label captured at time of the action';

COMMENT ON COLUMN upchieve.user_actions.quiz_category IS 'not_pii: Quiz category label captured at time of the action';

COMMENT ON COLUMN upchieve.user_actions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_actions.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_actions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.user_actions.reference_email IS 'pii: Email address of the volunteer reference at time of the action';

COMMENT ON COLUMN upchieve.user_actions.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';

COMMENT ON COLUMN upchieve.user_actions.ban_reason IS 'not_pii: Reason text recorded when a ban action was taken';

COMMENT ON COLUMN upchieve.user_actions.clientuuid IS 'not_pii: Client-generated UUID for deduplicating action events';

COMMENT ON TABLE upchieve.user_product_flags IS 'Per-user feature flags, experiment enrollments, and onboarding email send status';

COMMENT ON COLUMN upchieve.user_product_flags.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.user_product_flags.sent_ready_to_coach_email IS 'not_pii: Whether the ready-to-coach onboarding email has been sent';

COMMENT ON COLUMN upchieve.user_product_flags.sent_hour_summary_intro_email IS 'not_pii: Whether the hour summary intro email has been sent';

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_thirty_day_email IS 'not_pii: Whether the 30-day inactivity re-engagement email has been sent';

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_sixty_day_email IS 'not_pii: Whether the 60-day inactivity re-engagement email has been sent';

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_ninety_day_email IS 'not_pii: Whether the 90-day inactivity re-engagement email has been sent';

COMMENT ON COLUMN upchieve.user_product_flags.gates_qualified IS 'not_pii: Whether the user qualifies for the Gates Foundation study';

COMMENT ON COLUMN upchieve.user_product_flags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_product_flags.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_product_flags.in_gates_study IS 'not_pii: Whether the user is enrolled in the Gates Foundation study';

COMMENT ON COLUMN upchieve.user_product_flags.fall_incentive_program IS 'not_pii: Whether the user is enrolled in the fall incentive program';

COMMENT ON COLUMN upchieve.user_product_flags.paid_tutors_pilot_group IS 'not_pii: Whether the user is in the paid tutors pilot';

COMMENT ON COLUMN upchieve.user_product_flags.fall_incentive_enrollment_at IS 'not_pii: Timestamp when the user enrolled in the fall incentive program';

COMMENT ON COLUMN upchieve.user_product_flags.impact_study_enrollment_at IS 'not_pii: Timestamp when the user enrolled in the impact study';

COMMENT ON COLUMN upchieve.user_product_flags.impact_study_campaigns IS 'not_pii: JSON map of impact study campaign assignments for the user';

COMMENT ON TABLE upchieve.user_roles IS 'Reference table of user roles';

COMMENT ON COLUMN upchieve.user_roles.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.user_roles.name IS 'not_pii: Human-readable name';

COMMENT ON COLUMN upchieve.user_roles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_roles.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.user_session_metrics IS 'Aggregated counts of session-level behavioral flags per user';

COMMENT ON COLUMN upchieve.user_session_metrics.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.user_session_metrics.absent_student IS 'not_pii: Count of sessions where the student was flagged as absent';

COMMENT ON COLUMN upchieve.user_session_metrics.absent_volunteer IS 'not_pii: Count of sessions where the volunteer was flagged as absent';

COMMENT ON COLUMN upchieve.user_session_metrics.low_session_rating_from_coach IS 'not_pii: Count of low session ratings submitted by the volunteer';

COMMENT ON COLUMN upchieve.user_session_metrics.low_session_rating_from_student IS 'not_pii: Count of low session ratings submitted by the student';

COMMENT ON COLUMN upchieve.user_session_metrics.low_coach_rating_from_student IS 'not_pii: Count of low coach ratings submitted by the student';

COMMENT ON COLUMN upchieve.user_session_metrics.reported IS 'not_pii: Count of times the user has been reported';

COMMENT ON COLUMN upchieve.user_session_metrics.only_looking_for_answers IS 'not_pii: Count of pressuring-coach session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.rude_or_inappropriate IS 'not_pii: Count of mean-or-inappropriate session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.comment_from_student IS 'not_pii: Count of comment-from-student session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.comment_from_volunteer IS 'not_pii: Count of comment-from-volunteer session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.has_been_unmatched IS 'not_pii: Count of has-been-unmatched session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.has_had_technical_issues IS 'not_pii: Count of technical-issues session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_session_metrics.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.user_session_metrics.personal_identifying_info IS 'not_pii: Count of PII session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.coach_uncomfortable IS 'not_pii: Count of coach-uncomfortable session flags';

COMMENT ON COLUMN upchieve.user_session_metrics.student_crisis IS 'not_pii: Count of student-in-distress session flags';

COMMENT ON TABLE upchieve.users IS 'All user accounts on the platform';

COMMENT ON COLUMN upchieve.users.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.users.verified IS 'not_pii: Whether one of the user notification methods has been verified';

COMMENT ON COLUMN upchieve.users.email_verified IS 'not_pii: Whether the user has verified their email address';

COMMENT ON COLUMN upchieve.users.phone_verified IS 'not_pii: Whether the user has verified their phone number';

COMMENT ON COLUMN upchieve.users.email IS 'pii: User email address';

COMMENT ON COLUMN upchieve.users.password IS 'pii: Hashed password';

COMMENT ON COLUMN upchieve.users.password_reset_token IS 'pii: Token used to reset the user password';

COMMENT ON COLUMN upchieve.users.first_name IS 'pii: First name';

COMMENT ON COLUMN upchieve.users.last_name IS 'pii: Last name';

COMMENT ON COLUMN upchieve.users.deactivated IS 'not_pii: Whether the user account has been deactivated';

COMMENT ON COLUMN upchieve.users.last_activity_at IS 'not_pii: Timestamp of the most recent user activity';

COMMENT ON COLUMN upchieve.users.referral_code IS 'not_pii: Unique code used to refer new users';

COMMENT ON COLUMN upchieve.users.test_user IS 'not_pii: Whether the account is a test or internal account';

COMMENT ON COLUMN upchieve.users.banned IS 'not_pii: Whether the user has been banned';

COMMENT ON COLUMN upchieve.users.ban_reason_id IS 'not_pii: Foreign key to upchieve.ban_reasons';

COMMENT ON COLUMN upchieve.users.time_tutored IS 'not_pii: Duration of active tutoring in milliseconds';

COMMENT ON COLUMN upchieve.users.signup_source_id IS 'not_pii: Foreign key to upchieve.signup_sources';

COMMENT ON COLUMN upchieve.users.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users.phone IS 'pii: Phone number';

COMMENT ON COLUMN upchieve.users.sms_consent IS 'not_pii: Whether the user has consented to receive SMS messages';

COMMENT ON COLUMN upchieve.users.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';

COMMENT ON COLUMN upchieve.users.other_signup_source IS 'not_pii: Free-text signup source when not in the standard list';

COMMENT ON COLUMN upchieve.users.proxy_email IS 'pii: Alternate email';

COMMENT ON COLUMN upchieve.users.ban_type IS 'not_pii: Type of ban (shadow, complete, live_media)';

COMMENT ON COLUMN upchieve.users.preferred_language_code IS 'not_pii: IETF language tag for the user preferred language';

COMMENT ON COLUMN upchieve.users.preferred_language IS 'not_pii: Display name of the user preferred language';

COMMENT ON COLUMN upchieve.users.deleted IS 'not_pii: Soft-delete flag';

COMMENT ON TABLE upchieve.users_certifications IS 'Join table tracking which certifications each volunteer has earned';

COMMENT ON COLUMN upchieve.users_certifications.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_certifications.certification_id IS 'not_pii: Foreign key to upchieve.certifications';

COMMENT ON COLUMN upchieve.users_certifications.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_certifications.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_ip_addresses IS 'Join table associating users with IP addresses they have used';

COMMENT ON COLUMN upchieve.users_ip_addresses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.users_ip_addresses.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';

COMMENT ON COLUMN upchieve.users_ip_addresses.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_ip_addresses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_ip_addresses.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_quizzes IS 'Join table tracking volunteer quiz attempts and pass/fail status';

COMMENT ON COLUMN upchieve.users_quizzes.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_quizzes.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';

COMMENT ON COLUMN upchieve.users_quizzes.attempts IS 'not_pii: Number of quiz attempts by the user';

COMMENT ON COLUMN upchieve.users_quizzes.passed IS 'not_pii: Whether the user has passed the quiz';

COMMENT ON COLUMN upchieve.users_quizzes.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_quizzes.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_roles IS 'Join table assigning roles to users';

COMMENT ON COLUMN upchieve.users_roles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_roles.role_id IS 'not_pii: Foreign key to a roles lookup table';

COMMENT ON COLUMN upchieve.users_roles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_roles.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_schools IS 'Join table associating users with schools';

COMMENT ON COLUMN upchieve.users_schools.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_schools.school_id IS 'not_pii: Foreign key to upchieve.schools';

COMMENT ON COLUMN upchieve.users_schools.association_type IS 'not_pii: Type of user-school association (student_at_school or teacher_at_school)';

COMMENT ON COLUMN upchieve.users_schools.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_schools.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_student_partner_orgs_instances IS 'Represents active/deactivated status of a student''s affiliationi with a student partner org';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_site_id IS 'not_pii: Foreign key to upchieve.student_partner_org_sites';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_user_id IS 'not_pii: @deprecated';

COMMENT ON TABLE upchieve.users_surveys IS 'Surveys that have been completed by a user';

COMMENT ON COLUMN upchieve.users_surveys.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.users_surveys.survey_id IS 'not_pii: Foreign key to upchieve.surveys';

COMMENT ON COLUMN upchieve.users_surveys.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_surveys.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.users_surveys.survey_type_id IS 'not_pii: Foreign key to upchieve.survey_types';

COMMENT ON COLUMN upchieve.users_surveys.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_surveys.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_surveys.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';

COMMENT ON TABLE upchieve.users_surveys_submissions IS 'Individual response submissions for a user''s survey';

COMMENT ON COLUMN upchieve.users_surveys_submissions.user_survey_id IS 'not_pii: Foreign key to upchieve.users_surveys';

COMMENT ON COLUMN upchieve.users_surveys_submissions.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';

COMMENT ON COLUMN upchieve.users_surveys_submissions.survey_response_choice_id IS 'not_pii: Foreign key to upchieve.survey_response_choices';

COMMENT ON COLUMN upchieve.users_surveys_submissions.open_response IS 'not_pii: Free-text response to an open-ended survey question';

COMMENT ON COLUMN upchieve.users_surveys_submissions.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_surveys_submissions.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_training_courses IS 'Join table tracking each volunteer''s progress through training courses';

COMMENT ON COLUMN upchieve.users_training_courses.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_training_courses.training_course_id IS 'not_pii: Foreign key to upchieve.training_courses';

COMMENT ON COLUMN upchieve.users_training_courses.complete IS 'not_pii: Whether the training course has been completed';

COMMENT ON COLUMN upchieve.users_training_courses.progress IS 'not_pii: Completion percentage of the training course (0-100)';

COMMENT ON COLUMN upchieve.users_training_courses.completed_materials IS 'not_pii: Array of completed training material identifiers';

COMMENT ON COLUMN upchieve.users_training_courses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_training_courses.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.users_volunteer_partner_orgs_instances IS 'Represents active/deactivated status of a volunteer''s affiliation with a volunteer partner org';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.volunteer_occupations IS 'Job titles or occupations reported by volunteers during onboarding';

COMMENT ON COLUMN upchieve.volunteer_occupations.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.volunteer_occupations.occupation IS 'pii: Volunteer job title or occupation';

COMMENT ON COLUMN upchieve.volunteer_occupations.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_occupations.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.volunteer_partner_orgs IS 'Organizations whose employees volunteer on the platform';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.key IS 'not_pii: Unique URL-safe slug';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.name IS 'not_pii: Human-readable name of the volunteer partner organization';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.receive_weekly_hour_summary_email IS 'not_pii: Whether the org receives weekly volunteer hour summary emails';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.volunteer_partner_orgs_upchieve_instances IS 'Represents active/deactivated status a volunteer partner org''s partnership';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the volunteer org was no longer part of the volunteer partner organization';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.volunteer_profiles IS 'Profile data about volunteer users';

COMMENT ON COLUMN upchieve.volunteer_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.volunteer_profiles.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';

COMMENT ON COLUMN upchieve.volunteer_profiles.timezone IS 'pii: IANA timezone identifier';

COMMENT ON COLUMN upchieve.volunteer_profiles.approved IS 'not_pii: Whether the volunteer application has been approved';

COMMENT ON COLUMN upchieve.volunteer_profiles.onboarded IS 'not_pii: Whether the volunteer has completed all onboarding steps';

COMMENT ON COLUMN upchieve.volunteer_profiles.photo_id_s3_key IS 'pii: S3 object key for the volunteer photo ID upload';

COMMENT ON COLUMN upchieve.volunteer_profiles.photo_id_status IS 'not_pii: Foreign key to upchieve.photo_id_statuses';

COMMENT ON COLUMN upchieve.volunteer_profiles.linkedin_url IS 'pii: Volunteer LinkedIn profile URL';

COMMENT ON COLUMN upchieve.volunteer_profiles.college IS 'pii: College or university name';

COMMENT ON COLUMN upchieve.volunteer_profiles.company IS 'pii: Volunteer employer company name';

COMMENT ON COLUMN upchieve.volunteer_profiles.languages IS 'not_pii: Languages the volunteer speaks';

COMMENT ON COLUMN upchieve.volunteer_profiles.experience IS 'not_pii: JSON blob of volunteer professional experience';

COMMENT ON COLUMN upchieve.volunteer_profiles.city IS 'pii: City of residence';

COMMENT ON COLUMN upchieve.volunteer_profiles.state IS 'pii: US state abbreviation';

COMMENT ON COLUMN upchieve.volunteer_profiles.country IS 'pii: Country of residence';

COMMENT ON COLUMN upchieve.volunteer_profiles.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_profiles.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_profiles.total_volunteer_hours IS 'not_pii: Cumulative tutoring hours logged by the volunteer, only calculated for config.customVolunteerPartnerOrgs';

COMMENT ON COLUMN upchieve.volunteer_profiles.elapsed_availability IS 'not_pii: Cumulative hours the volunteer was marked available on their calendar';

COMMENT ON TABLE upchieve.volunteer_reference_statuses IS 'Reference table for the status of a volunteer''s reference request';

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.name IS 'not_pii: Human-readable name of the status of the reference';

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.updated_at IS 'not_pii';

COMMENT ON TABLE upchieve.volunteer_references IS 'References for volunteers';

COMMENT ON COLUMN upchieve.volunteer_references.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.volunteer_references.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.volunteer_references.first_name IS 'pii: First name of the reference';

COMMENT ON COLUMN upchieve.volunteer_references.last_name IS 'pii: Last name of the reference';

COMMENT ON COLUMN upchieve.volunteer_references.email IS 'pii: User email address of the reference';

COMMENT ON COLUMN upchieve.volunteer_references.status_id IS 'not_pii: Foreign key to upchieve.volunteer_reference_statuses; the current status of the reference request';

COMMENT ON COLUMN upchieve.volunteer_references.sent_at IS 'not_pii: Timestamp when the reference request was sent';

COMMENT ON COLUMN upchieve.volunteer_references.affiliation IS 'pii: Reference contact relationship to the volunteer (e.g. colleague, professor)';

COMMENT ON COLUMN upchieve.volunteer_references.relationship_length IS 'pii: How long the reference has known the volunteer';

COMMENT ON COLUMN upchieve.volunteer_references.patient IS 'not_pii: Reference rating for patience (1-5)';

COMMENT ON COLUMN upchieve.volunteer_references.positive_role_model IS 'not_pii: Reference rating for being a positive role model (1-5)';

COMMENT ON COLUMN upchieve.volunteer_references.agreeable_and_approachable IS 'not_pii: Reference rating for agreeableness and approachability (1-5)';

COMMENT ON COLUMN upchieve.volunteer_references.communicates_effectively IS 'not_pii: Reference rating for communication effectiveness (1-5)';

COMMENT ON COLUMN upchieve.volunteer_references.rejection_reason IS 'pii: Reason the reference submission was rejected';

COMMENT ON COLUMN upchieve.volunteer_references.additional_info IS 'pii: Additional notes provided by the reference';

COMMENT ON COLUMN upchieve.volunteer_references.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_references.updated_at IS 'not_pii';

COMMENT ON COLUMN upchieve.volunteer_references.trustworthy_with_children IS 'not_pii: Reference rating for trustworthiness with children (1-5)';

COMMENT ON TABLE upchieve.weekdays IS 'Reference table of the days of the week';

COMMENT ON COLUMN upchieve.weekdays.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.weekdays.day IS 'not_pii: Name of the weekday (e.g. Monday)';

COMMENT ON COLUMN upchieve.weekdays.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.weekdays.updated_at IS 'not_pii';

-- migrate:down
-- no-op - we don't need to remove comments.
