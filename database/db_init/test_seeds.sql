--
-- PostgreSQL database dump
--

-- Dumped from database version 14.12 (Debian 14.12-1.pgdg120+1)
-- Dumped by pg_dump version 14.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: ban_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ban_reasons (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: signup_sources; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.signup_sources (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users (id, verified, email_verified, phone_verified, email, password, password_reset_token, first_name, last_name, deactivated, last_activity_at, referral_code, referred_by, test_user, banned, ban_reason_id, time_tutored, signup_source_id, created_at, updated_at, phone, sms_consent, mongo_id, other_signup_source, proxy_email, ban_type) FROM stdin;
\.


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.admin_profiles (user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tool_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.tool_types (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.topics (id, name, icon_link, color, dashboard_order, display_name, created_at, updated_at, training_order) FROM stdin;
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.subjects (id, name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at, active) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_roles (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions (id, student_id, volunteer_id, subject_id, has_whiteboard_doc, quill_doc, volunteer_joined_at, ended_at, ended_by_role_id, reviewed, to_review, student_banned, time_tutored, created_at, updated_at, mongo_id, shadowbanned) FROM stdin;
\.


--
-- Data for Name: assistments_data; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at, sent_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sponsor_orgs (id, name, created_at, updated_at, key) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs (id, key, name, signup_code, high_school_signup, college_signup, school_signup_required, created_at, updated_at, school_id) FROM stdin;
\.


--
-- Data for Name: volunteer_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_partner_orgs (id, key, name, receive_weekly_hour_summary_email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: associated_partners; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: weekdays; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.weekdays (id, day, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: availabilities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: availability_histories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.availability_histories (id, user_id, weekday_id, available_start, available_end, timezone, recorded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: censored_session_messages; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at) FROM stdin;
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certifications (id, name, created_at, updated_at, active) FROM stdin;
\.


--
-- Data for Name: certification_subject_unlocks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: us_states; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.us_states (code, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.cities (id, name, us_state_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: computed_subject_unlocks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.computed_subject_unlocks (subject_id, certification_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contact_form_submissions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.contact_form_submissions (id, user_id, user_email, message, topic, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: federated_credentials; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.federated_credentials (id, issuer, user_id) FROM stdin;
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, legacy_feedbacks, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: grade_levels; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.grade_levels (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ip_addresses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ip_addresses (id, ip, status, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: postal_codes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.postal_codes (code, us_state_code, income, location, created_at, updated_at, cbsa_income, state_income) FROM stdin;
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools (id, name, approved, partner, city_id, created_at, updated_at, mongo_id, legacy_city_name) FROM stdin;
\.


--
-- Data for Name: ineligible_students; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, created_at, updated_at, mongo_id, referred_by) FROM stdin;
\.


--
-- Data for Name: legacy_availability_histories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.legacy_availability_histories (id, mongo_id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: muted_users_subject_alerts; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.muted_users_subject_alerts (user_id, subject_id, created_at) FROM stdin;
\.


--
-- Data for Name: notification_methods; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_methods (id, method, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_priority_groups; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_priority_groups (id, name, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_types (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, message_carrier_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: parents_guardians; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.parents_guardians (id, email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_org_sites; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_profiles (user_id, college, school_id, postal_code, grade_level_id, student_partner_org_user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: parents_guardians_students; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.parents_guardians_students (parents_guardians_id, students_id) FROM stdin;
\.


--
-- Data for Name: photo_id_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.photo_id_statuses (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pre_session_surveys; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.pre_session_surveys (id, response_data, session_id, user_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: progress_report_analysis_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_analysis_types (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_prompts; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_prompts (id, subject_id, prompt, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_statuses (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_reports; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_reports (id, user_id, status_id, created_at, updated_at, read_at, prompt_id) FROM stdin;
\.


--
-- Data for Name: progress_report_concepts; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_concepts (id, name, description, grade, progress_report_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_focus_areas; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_focus_areas (id, name, display_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_info_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_info_types (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_concept_details; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_sessions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_summaries; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_summaries (id, summary, overall_grade, progress_report_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progress_report_summary_details; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: push_tokens; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.push_tokens (id, user_id, token, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.question_tags (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: question_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.question_types (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quizzes (id, name, created_at, updated_at, active, questions_per_subcategory) FROM stdin;
\.


--
-- Data for Name: quiz_certification_grants; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_subcategories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_subcategories (id, name, quiz_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_questions (id, question_text, possible_answers, correct_answer, quiz_subcategory_id, image_source, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: quiz_review_materials; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_review_materials (id, quiz_id, title, pdf, image, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: report_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.report_reasons (id, reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: required_email_domains; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: school_nces_metadata; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.school_nces_metadata (school_id, created_at, updated_at, school_year, fipst, statename, st, sch_name, lea_name, state_agency_no, "union", st_leaid, leaid, st_schid, ncessch, schid, mstreet1, mstreet2, mstreet3, mcity, mstate, mzip, mzip4, lstreet1, lstreet2, lstreet3, lcity, lzip, lzip4, phone, website, sy_status, sy_status_text, updated_status, updated_status_text, effective_date, sch_type, sch_type_text, recon_status, out_of_state_flag, charter_text, chartauth1, chartauthn1, chartauth2, chartauthn2, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, igoffered, is_school_wide_title1, is_title1_eligible, national_school_lunch_program, total_students, nslp_direct_certification, frl_eligible) FROM stdin;
\.


--
-- Data for Name: schools_sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schools_sponsor_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools_sponsor_orgs_instances (school_id, sponsor_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_failed_joins; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_failed_joins (session_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_flags (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_messages; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_messages (id, sender_id, contents, session_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: session_photos; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_photos (session_id, photo_key, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_reports; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_review_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_review_reasons (session_id, session_flag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions_session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions_session_flags (session_id, session_flag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sponsor_orgs_upchieve_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sponsor_orgs_upchieve_instances (id, sponsor_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sponsor_orgs_volunteer_partner_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sponsor_orgs_volunteer_partner_orgs_instances (sponsor_org_id, volunteer_partner_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_favorite_volunteers; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs_sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs_sponsor_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs_sponsor_orgs_instances (student_partner_org_id, sponsor_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs_upchieve_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs_upchieve_instances (id, student_partner_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs_volunteer_partner_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs_volunteer_partner_orgs_instances (student_partner_org_id, volunteer_partner_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: survey_questions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.survey_questions (id, question_type_id, question_text, created_at, updated_at, response_display_text, replacement_column_1, replacement_column_2) FROM stdin;
\.


--
-- Data for Name: survey_questions_question_tags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.survey_questions_question_tags (id, survey_question_id, question_tag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: survey_response_choices; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.survey_response_choices (id, score, choice_text, created_at, updated_at, display_image) FROM stdin;
\.


--
-- Data for Name: surveys; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.surveys (id, name, created_at, updated_at, role_id) FROM stdin;
\.


--
-- Data for Name: surveys_survey_questions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.surveys_survey_questions (id, survey_id, survey_question_id, display_priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: survey_questions_response_choices; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.survey_questions_response_choices (response_choice_id, display_priority, created_at, updated_at, surveys_survey_question_id) FROM stdin;
\.


--
-- Data for Name: survey_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.survey_types (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: surveys_context; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teacher_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.teacher_profiles (user_id, school_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.training_courses (id, name, created_at, updated_at, display_name) FROM stdin;
\.


--
-- Data for Name: user_actions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_actions (id, user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, quiz_subcategory, quiz_category, created_at, updated_at, mongo_id, reference_email, volunteer_id, ban_reason) FROM stdin;
\.


--
-- Data for Name: user_product_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_product_flags (user_id, sent_ready_to_coach_email, sent_hour_summary_intro_email, sent_inactive_thirty_day_email, sent_inactive_sixty_day_email, sent_inactive_ninety_day_email, gates_qualified, created_at, updated_at, in_gates_study, fall_incentive_program, paid_tutors_pilot_group) FROM stdin;
\.


--
-- Data for Name: user_session_metrics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_session_metrics (user_id, absent_student, absent_volunteer, low_session_rating_from_coach, low_session_rating_from_student, low_coach_rating_from_student, reported, only_looking_for_answers, rude_or_inappropriate, comment_from_student, comment_from_volunteer, has_been_unmatched, has_had_technical_issues, created_at, updated_at, personal_identifying_info, graded_assignment, coach_uncomfortable, student_crisis) FROM stdin;
\.


--
-- Data for Name: users_certifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_certifications (user_id, certification_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_ip_addresses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_quizzes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_roles (user_id, role_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_student_partner_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_student_partner_orgs_instances (user_id, student_partner_org_id, student_partner_org_site_id, deactivated_on, created_at, updated_at, student_partner_org_user_id) FROM stdin;
\.


--
-- Data for Name: users_surveys; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_surveys (id, survey_id, user_id, session_id, survey_type_id, created_at, updated_at, progress_report_id) FROM stdin;
\.


--
-- Data for Name: users_surveys_submissions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_training_courses (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_volunteer_partner_orgs_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_occupations; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_occupations (user_id, occupation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_partner_orgs_upchieve_instances; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_partner_orgs_upchieve_instances (id, volunteer_partner_org_id, deactivated_on, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_profiles (user_id, volunteer_partner_org_id, timezone, approved, onboarded, photo_id_s3_key, photo_id_status, linkedin_url, college, company, languages, experience, city, state, country, created_at, updated_at, total_volunteer_hours, elapsed_availability) FROM stdin;
\.


--
-- Data for Name: volunteer_reference_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_reference_statuses (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_references; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_references (id, user_id, first_name, last_name, email, status_id, sent_at, affiliation, relationship_length, patient, positive_role_model, agreeable_and_approachable, communicates_effectively, rejection_reason, additional_info, created_at, updated_at, trustworthy_with_children) FROM stdin;
\.


--
-- Name: ban_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.ban_reasons_id_seq', 1, false);


--
-- Name: certifications_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.certifications_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.cities_id_seq', 1, false);


--
-- Name: grade_levels_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.grade_levels_id_seq', 1, false);


--
-- Name: ip_addresses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.ip_addresses_id_seq', 1, false);


--
-- Name: notification_methods_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_methods_id_seq', 1, false);


--
-- Name: notification_priority_groups_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_priority_groups_id_seq', 1, false);


--
-- Name: notification_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_types_id_seq', 1, false);


--
-- Name: photo_id_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.photo_id_statuses_id_seq', 1, false);


--
-- Name: progress_report_analysis_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.progress_report_analysis_types_id_seq', 1, false);


--
-- Name: progress_report_focus_areas_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.progress_report_focus_areas_id_seq', 1, false);


--
-- Name: progress_report_info_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.progress_report_info_types_id_seq', 1, false);


--
-- Name: progress_report_prompts_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.progress_report_prompts_id_seq', 1, false);


--
-- Name: progress_report_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.progress_report_statuses_id_seq', 1, false);


--
-- Name: question_tags_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.question_tags_id_seq', 1, false);


--
-- Name: question_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.question_types_id_seq', 1, false);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_review_materials_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_review_materials_id_seq', 1, false);


--
-- Name: quiz_subcategories_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_subcategories_id_seq', 1, false);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quizzes_id_seq', 1, false);


--
-- Name: report_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.report_reasons_id_seq', 1, false);


--
-- Name: session_flags_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.session_flags_id_seq', 1, false);


--
-- Name: signup_sources_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.signup_sources_id_seq', 1, false);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.subjects_id_seq', 1, false);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.survey_questions_id_seq', 1, false);


--
-- Name: survey_questions_question_tags_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.survey_questions_question_tags_id_seq', 1, false);


--
-- Name: survey_response_choices_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.survey_response_choices_id_seq', 1, false);


--
-- Name: survey_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.survey_types_id_seq', 1, false);


--
-- Name: surveys_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.surveys_id_seq', 1, false);


--
-- Name: surveys_survey_questions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.surveys_survey_questions_id_seq', 1, false);


--
-- Name: tool_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.tool_types_id_seq', 1, false);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.topics_id_seq', 1, false);


--
-- Name: training_courses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.training_courses_id_seq', 1, false);


--
-- Name: user_actions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.user_actions_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.user_roles_id_seq', 1, false);


--
-- Name: volunteer_reference_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.volunteer_reference_statuses_id_seq', 1, false);


--
-- Name: weekdays_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.weekdays_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

