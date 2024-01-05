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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: basic_access; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA basic_access;


--
-- Name: upchieve; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA upchieve;


--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: generate_ulid(); Type: FUNCTION; Schema: upchieve; Owner: -
--

CREATE FUNCTION upchieve.generate_ulid() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  timestamp  BYTEA = E'\\000\\000\\000\\000\\000\\000';

  unix_time  BIGINT;
  ulid       BYTEA;
BEGIN
  -- 6 timestamp bytes
  unix_time = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  timestamp = SET_BYTE(timestamp, 0, (unix_time >> 40)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 1, (unix_time >> 32)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 2, (unix_time >> 24)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 3, (unix_time >> 16)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 4, (unix_time >> 8)::BIT(8)::INTEGER);
  timestamp = SET_BYTE(timestamp, 5, unix_time::BIT(8)::INTEGER);

  -- 10 entropy bytes
  ulid = timestamp || public.gen_random_bytes(10);

  RETURN CAST( substring(CAST (ulid AS text) from 3) AS uuid);
END
$$;


--
-- Name: refresh_users_subjects_mview(); Type: FUNCTION; Schema: upchieve; Owner: -
--

CREATE FUNCTION upchieve.refresh_users_subjects_mview() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW upchieve.users_subjects_mview;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: session; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: seed_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: admin_profiles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.admin_profiles (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assistments_data; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.assistments_data (
    id uuid NOT NULL,
    problem_id integer NOT NULL,
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    session_id uuid NOT NULL,
    sent boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    mongo_id character varying(24)
);


--
-- Name: associated_partners; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.associated_partners (
    id uuid NOT NULL,
    key text NOT NULL,
    volunteer_partner_org_id uuid NOT NULL,
    student_partner_org_id uuid,
    student_sponsor_org_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: availabilities; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.availabilities (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    weekday_id integer NOT NULL,
    available_start smallint NOT NULL,
    available_end smallint NOT NULL,
    timezone text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: availability_histories; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.availability_histories (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    weekday_id integer NOT NULL,
    available_start smallint NOT NULL,
    available_end smallint NOT NULL,
    timezone text NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ban_reasons; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.ban_reasons (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ban_reasons_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.ban_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ban_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.ban_reasons_id_seq OWNED BY upchieve.ban_reasons.id;


--
-- Name: certification_subject_unlocks; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.certification_subject_unlocks (
    subject_id integer NOT NULL,
    certification_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: certifications; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.certifications (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT false NOT NULL
);


--
-- Name: certifications_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.certifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certifications_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.certifications_id_seq OWNED BY upchieve.certifications.id;


--
-- Name: cities; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.cities (
    id integer NOT NULL,
    name text NOT NULL,
    us_state_code character varying(2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.cities_id_seq OWNED BY upchieve.cities.id;


--
-- Name: computed_subject_unlocks; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.computed_subject_unlocks (
    subject_id integer NOT NULL,
    certification_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: contact_form_submissions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.contact_form_submissions (
    id uuid NOT NULL,
    user_id uuid,
    user_email text,
    message text NOT NULL,
    topic text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: federated_credentials; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.federated_credentials (
    id text NOT NULL,
    issuer text NOT NULL,
    user_id uuid
);


--
-- Name: feedbacks; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.feedbacks (
    id uuid NOT NULL,
    topic_id integer,
    subject_id integer,
    user_role_id integer NOT NULL,
    session_id uuid NOT NULL,
    student_tutoring_feedback jsonb,
    student_counseling_feedback jsonb,
    volunteer_feedback jsonb,
    comment text,
    user_id uuid NOT NULL,
    legacy_feedbacks jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: grade_levels; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.grade_levels (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grade_levels_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.grade_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grade_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.grade_levels_id_seq OWNED BY upchieve.grade_levels.id;


--
-- Name: ineligible_students; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.ineligible_students (
    id uuid NOT NULL,
    email text NOT NULL,
    postal_code text,
    ip_address_id bigint,
    school_id uuid,
    grade_level_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    referred_by uuid
);


--
-- Name: ip_addresses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.ip_addresses (
    id bigint NOT NULL,
    ip inet NOT NULL,
    status text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: ip_addresses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.ip_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ip_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.ip_addresses_id_seq OWNED BY upchieve.ip_addresses.id;


--
-- Name: legacy_availability_histories; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.legacy_availability_histories (
    id uuid NOT NULL,
    mongo_id character varying(26) NOT NULL,
    user_id uuid,
    timezone text,
    recorded_at timestamp with time zone NOT NULL,
    legacy_availability jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: muted_users_subject_alerts; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.muted_users_subject_alerts (
    user_id uuid NOT NULL,
    subject_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_methods; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.notification_methods (
    id integer NOT NULL,
    method text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_methods_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.notification_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.notification_methods_id_seq OWNED BY upchieve.notification_methods.id;


--
-- Name: notification_priority_groups; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.notification_priority_groups (
    id integer NOT NULL,
    name text NOT NULL,
    priority smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_priority_groups_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.notification_priority_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_priority_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.notification_priority_groups_id_seq OWNED BY upchieve.notification_priority_groups.id;


--
-- Name: notification_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.notification_types (
    id integer NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.notification_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_types_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.notification_types_id_seq OWNED BY upchieve.notification_types.id;


--
-- Name: notifications; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    sent_at timestamp with time zone,
    type_id integer NOT NULL,
    method_id integer NOT NULL,
    priority_group_id integer NOT NULL,
    successful boolean,
    session_id uuid NOT NULL,
    message_carrier_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: parents_guardians; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.parents_guardians (
    id uuid NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: parents_guardians_students; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.parents_guardians_students (
    parents_guardians_id uuid NOT NULL,
    students_id uuid NOT NULL
);


--
-- Name: photo_id_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.photo_id_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: photo_id_statuses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.photo_id_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: photo_id_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.photo_id_statuses_id_seq OWNED BY upchieve.photo_id_statuses.id;


--
-- Name: postal_codes; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.postal_codes (
    code text NOT NULL,
    us_state_code character varying(2),
    income integer,
    location point,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cbsa_income integer,
    state_income integer
);


--
-- Name: pre_session_surveys; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.pre_session_surveys (
    id uuid NOT NULL,
    response_data jsonb,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: progress_report_analysis_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_analysis_types (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_analysis_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.progress_report_analysis_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_report_analysis_types_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.progress_report_analysis_types_id_seq OWNED BY upchieve.progress_report_analysis_types.id;


--
-- Name: progress_report_concept_details; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_concept_details (
    id uuid NOT NULL,
    content text NOT NULL,
    progress_report_concept_id uuid NOT NULL,
    progress_report_focus_area_id integer NOT NULL,
    progress_report_info_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_concepts; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_concepts (
    id uuid NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    grade smallint NOT NULL,
    progress_report_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_focus_areas; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_focus_areas (
    id integer NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_focus_areas_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.progress_report_focus_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_report_focus_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.progress_report_focus_areas_id_seq OWNED BY upchieve.progress_report_focus_areas.id;


--
-- Name: progress_report_info_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_info_types (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_info_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.progress_report_info_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_report_info_types_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.progress_report_info_types_id_seq OWNED BY upchieve.progress_report_info_types.id;


--
-- Name: progress_report_sessions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_sessions (
    progress_report_id uuid NOT NULL,
    session_id uuid NOT NULL,
    progress_report_analysis_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_statuses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.progress_report_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_report_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.progress_report_statuses_id_seq OWNED BY upchieve.progress_report_statuses.id;


--
-- Name: progress_report_summaries; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_summaries (
    id uuid NOT NULL,
    summary text NOT NULL,
    overall_grade smallint NOT NULL,
    progress_report_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_report_summary_details; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_summary_details (
    id uuid NOT NULL,
    content text NOT NULL,
    progress_report_summary_id uuid NOT NULL,
    progress_report_focus_area_id integer NOT NULL,
    progress_report_info_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: progress_reports; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_reports (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    status_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone
);


--
-- Name: push_tokens; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.push_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_tags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.question_tags (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_tags_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.question_tags ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.question_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: question_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.question_types (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: question_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.question_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.question_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quiz_certification_grants; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.quiz_certification_grants (
    quiz_id integer NOT NULL,
    certification_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_questions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.quiz_questions (
    id integer NOT NULL,
    question_text text NOT NULL,
    possible_answers jsonb,
    correct_answer text NOT NULL,
    quiz_subcategory_id integer NOT NULL,
    image_source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.quiz_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.quiz_questions_id_seq OWNED BY upchieve.quiz_questions.id;


--
-- Name: quiz_review_materials; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.quiz_review_materials (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    title text NOT NULL,
    pdf text NOT NULL,
    image text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: quiz_review_materials_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.quiz_review_materials ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.quiz_review_materials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quiz_subcategories; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.quiz_subcategories (
    id integer NOT NULL,
    name text NOT NULL,
    quiz_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_subcategories_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.quiz_subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.quiz_subcategories_id_seq OWNED BY upchieve.quiz_subcategories.id;


--
-- Name: quizzes; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.quizzes (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT false NOT NULL,
    questions_per_subcategory smallint DEFAULT 1 NOT NULL
);


--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.quizzes_id_seq OWNED BY upchieve.quizzes.id;


--
-- Name: report_reasons; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.report_reasons (
    id integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: report_reasons_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.report_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.report_reasons_id_seq OWNED BY upchieve.report_reasons.id;


--
-- Name: required_email_domains; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.required_email_domains (
    id uuid NOT NULL,
    domain text NOT NULL,
    volunteer_partner_org_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_nces_metadata; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.school_nces_metadata (
    school_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    school_year text,
    fipst integer,
    statename text,
    st text,
    sch_name text,
    lea_name text,
    state_agency_no integer,
    "union" text,
    st_leaid text,
    leaid text,
    st_schid text,
    ncessch text,
    schid integer,
    mstreet1 text,
    mstreet2 text,
    mstreet3 text,
    mcity text,
    mstate text,
    mzip text,
    mzip4 text,
    lstreet1 text,
    lstreet2 text,
    lstreet3 text,
    lcity text,
    lzip text,
    lzip4 text,
    phone text,
    website text,
    sy_status integer,
    sy_status_text text,
    updated_status integer,
    updated_status_text text,
    effective_date text,
    sch_type integer,
    sch_type_text text,
    recon_status text,
    out_of_state_flag text,
    charter_text text,
    chartauth1 text,
    chartauthn1 text,
    chartauth2 text,
    chartauthn2 text,
    nogrades text,
    g_pk_offered text,
    g_kg_offered text,
    g_1_offered text,
    g_2_offered text,
    g_3_offered text,
    g_4_offered text,
    g_5_offered text,
    g_6_offered text,
    g_7_offered text,
    g_8_offered text,
    g_9_offered text,
    g_10_offered text,
    g_11_offered text,
    g_12_offered text,
    g_13_offered text,
    g_ug_offered text,
    g_ae_offered text,
    gslo text,
    gshi text,
    level text,
    igoffered text,
    is_school_wide_title1 boolean DEFAULT false NOT NULL,
    is_title1_eligible boolean DEFAULT false NOT NULL,
    national_school_lunch_program text,
    total_students integer,
    nslp_direct_certification integer,
    frl_eligible integer
);


--
-- Name: schools; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.schools (
    id uuid NOT NULL,
    name text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    partner boolean DEFAULT false NOT NULL,
    city_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    legacy_city_name text
);


--
-- Name: schools_sponsor_orgs; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.schools_sponsor_orgs (
    school_id uuid NOT NULL,
    sponsor_org_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schools_sponsor_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.schools_sponsor_orgs_instances (
    school_id uuid,
    sponsor_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_failed_joins; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_failed_joins (
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_flags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_flags (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_flags_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.session_flags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_flags_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.session_flags_id_seq OWNED BY upchieve.session_flags.id;


--
-- Name: session_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_messages (
    id uuid NOT NULL,
    sender_id uuid NOT NULL,
    contents text NOT NULL,
    session_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: session_photos; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_photos (
    session_id uuid NOT NULL,
    photo_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_reports; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_reports (
    id uuid NOT NULL,
    report_reason_id integer NOT NULL,
    report_message text,
    reporting_user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    reported_user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: session_review_reasons; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_review_reasons (
    session_id uuid NOT NULL,
    session_flag_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sessions (
    id uuid NOT NULL,
    student_id uuid NOT NULL,
    volunteer_id uuid,
    subject_id integer NOT NULL,
    has_whiteboard_doc boolean DEFAULT false NOT NULL,
    quill_doc text,
    volunteer_joined_at timestamp with time zone,
    ended_at timestamp with time zone,
    ended_by_role_id integer,
    reviewed boolean DEFAULT false NOT NULL,
    to_review boolean DEFAULT false NOT NULL,
    student_banned boolean,
    time_tutored bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24)
);


--
-- Name: sessions_session_flags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sessions_session_flags (
    session_id uuid NOT NULL,
    session_flag_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signup_sources; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.signup_sources (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signup_sources_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.signup_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signup_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.signup_sources_id_seq OWNED BY upchieve.signup_sources.id;


--
-- Name: sponsor_orgs; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sponsor_orgs (
    id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    key text NOT NULL
);


--
-- Name: sponsor_orgs_upchieve_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sponsor_orgs_upchieve_instances (
    id uuid NOT NULL,
    sponsor_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sponsor_orgs_volunteer_partner_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances (
    sponsor_org_id uuid,
    volunteer_partner_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_favorite_volunteers; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_favorite_volunteers (
    student_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_partner_org_sites; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_org_sites (
    id uuid NOT NULL,
    name text NOT NULL,
    student_partner_org_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_partner_orgs; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_orgs (
    id uuid NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    signup_code text,
    high_school_signup boolean DEFAULT false NOT NULL,
    college_signup boolean DEFAULT false NOT NULL,
    school_signup_required boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    school_id uuid
);


--
-- Name: student_partner_orgs_sponsor_orgs; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_orgs_sponsor_orgs (
    student_partner_org_id uuid NOT NULL,
    sponsor_org_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_partner_orgs_sponsor_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_orgs_sponsor_orgs_instances (
    student_partner_org_id uuid,
    sponsor_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_partner_orgs_upchieve_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_orgs_upchieve_instances (
    id uuid NOT NULL,
    student_partner_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_partner_orgs_volunteer_partner_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_partner_orgs_volunteer_partner_orgs_instances (
    student_partner_org_id uuid,
    volunteer_partner_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_profiles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_profiles (
    user_id uuid NOT NULL,
    college text,
    school_id uuid,
    postal_code text,
    grade_level_id integer,
    student_partner_org_user_id text,
    student_partner_org_id uuid,
    student_partner_org_site_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subjects; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.subjects (
    id integer NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    display_order integer NOT NULL,
    topic_id integer NOT NULL,
    tool_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.subjects_id_seq OWNED BY upchieve.subjects.id;


--
-- Name: survey_questions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.survey_questions (
    id integer NOT NULL,
    question_type_id integer NOT NULL,
    question_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    response_display_text text,
    replacement_column_1 text,
    replacement_column_2 text
);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.survey_questions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.survey_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_questions_question_tags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.survey_questions_question_tags (
    id integer NOT NULL,
    survey_question_id integer NOT NULL,
    question_tag_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: survey_questions_question_tags_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.survey_questions_question_tags ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.survey_questions_question_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_questions_response_choices; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.survey_questions_response_choices (
    response_choice_id integer NOT NULL,
    display_priority smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    surveys_survey_question_id integer NOT NULL
);


--
-- Name: survey_response_choices; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.survey_response_choices (
    id integer NOT NULL,
    score smallint NOT NULL,
    choice_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_image text
);


--
-- Name: survey_response_choices_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.survey_response_choices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.survey_response_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.survey_types (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: survey_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.survey_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.survey_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: surveys; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.surveys (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    role_id integer
);


--
-- Name: surveys_context; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.surveys_context (
    survey_id integer NOT NULL,
    subject_id integer,
    survey_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: surveys_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.surveys ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.surveys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: surveys_survey_questions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.surveys_survey_questions (
    id integer NOT NULL,
    survey_id integer NOT NULL,
    survey_question_id integer NOT NULL,
    display_priority smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: surveys_survey_questions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.surveys_survey_questions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.surveys_survey_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tool_types; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.tool_types (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tool_types_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.tool_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tool_types_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.tool_types_id_seq OWNED BY upchieve.tool_types.id;


--
-- Name: topics; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.topics (
    id integer NOT NULL,
    name text NOT NULL,
    icon_link text,
    color text,
    dashboard_order smallint NOT NULL,
    display_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    training_order smallint DEFAULT 0 NOT NULL
);


--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.topics_id_seq OWNED BY upchieve.topics.id;


--
-- Name: training_courses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.training_courses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name text
);


--
-- Name: training_courses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.training_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.training_courses_id_seq OWNED BY upchieve.training_courses.id;


--
-- Name: us_states; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.us_states (
    code character varying(2) NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_actions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.user_actions (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    action_type text,
    action text,
    ip_address_id bigint,
    device text,
    browser text,
    browser_version text,
    operating_system text,
    operating_system_version text,
    quiz_subcategory text,
    quiz_category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    reference_email text,
    volunteer_id uuid,
    ban_reason text
);


--
-- Name: user_actions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.user_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.user_actions_id_seq OWNED BY upchieve.user_actions.id;


--
-- Name: user_product_flags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.user_product_flags (
    user_id uuid NOT NULL,
    sent_ready_to_coach_email boolean DEFAULT false NOT NULL,
    sent_hour_summary_intro_email boolean DEFAULT false NOT NULL,
    sent_inactive_thirty_day_email boolean DEFAULT false NOT NULL,
    sent_inactive_sixty_day_email boolean DEFAULT false NOT NULL,
    sent_inactive_ninety_day_email boolean DEFAULT false NOT NULL,
    gates_qualified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    in_gates_study boolean DEFAULT false NOT NULL,
    fall_incentive_program boolean DEFAULT false NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.user_roles (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.user_roles_id_seq OWNED BY upchieve.user_roles.id;


--
-- Name: user_session_metrics; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.user_session_metrics (
    user_id uuid NOT NULL,
    absent_student integer DEFAULT 0 NOT NULL,
    absent_volunteer integer DEFAULT 0 NOT NULL,
    low_session_rating_from_coach integer DEFAULT 0 NOT NULL,
    low_session_rating_from_student integer DEFAULT 0 NOT NULL,
    low_coach_rating_from_student integer DEFAULT 0 NOT NULL,
    reported integer DEFAULT 0 NOT NULL,
    only_looking_for_answers integer DEFAULT 0 NOT NULL,
    rude_or_inappropriate integer DEFAULT 0 NOT NULL,
    comment_from_student integer DEFAULT 0 NOT NULL,
    comment_from_volunteer integer DEFAULT 0 NOT NULL,
    has_been_unmatched integer DEFAULT 0 NOT NULL,
    has_had_technical_issues integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    personal_identifying_info integer DEFAULT 0 NOT NULL,
    graded_assignment integer DEFAULT 0 NOT NULL,
    coach_uncomfortable integer DEFAULT 0 NOT NULL,
    student_crisis integer DEFAULT 0 NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users (
    id uuid NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    email text NOT NULL,
    password text,
    password_reset_token text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    deactivated boolean DEFAULT false NOT NULL,
    last_activity_at timestamp with time zone,
    referral_code text NOT NULL,
    referred_by uuid,
    test_user boolean DEFAULT false NOT NULL,
    banned boolean DEFAULT false NOT NULL,
    ban_reason_id integer,
    time_tutored bigint,
    signup_source_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    sms_consent boolean DEFAULT false NOT NULL,
    mongo_id character varying(24),
    other_signup_source text,
    proxy_email text
);


--
-- Name: users_certifications; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_certifications (
    user_id uuid NOT NULL,
    certification_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_ip_addresses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_ip_addresses (
    id uuid NOT NULL,
    ip_address_id integer NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_quizzes; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_quizzes (
    user_id uuid NOT NULL,
    quiz_id integer NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_roles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_student_partner_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_student_partner_orgs_instances (
    user_id uuid,
    student_partner_org_id uuid,
    student_partner_org_site_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    student_partner_org_user_id text
);


--
-- Name: volunteer_profiles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_profiles (
    user_id uuid NOT NULL,
    volunteer_partner_org_id uuid,
    timezone text,
    approved boolean DEFAULT false NOT NULL,
    onboarded boolean DEFAULT false NOT NULL,
    photo_id_s3_key text,
    photo_id_status integer,
    linkedin_url text,
    college text,
    company text,
    languages text[],
    experience jsonb,
    city text,
    state text,
    country text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    total_volunteer_hours double precision,
    elapsed_availability bigint
);


--
-- Name: users_subjects_mview; Type: MATERIALIZED VIEW; Schema: upchieve; Owner: -
--

CREATE MATERIALIZED VIEW upchieve.users_subjects_mview AS
 WITH subject_totals AS (
         SELECT subjects.id,
            (count(*))::integer AS total
           FROM (upchieve.certification_subject_unlocks
             JOIN upchieve.subjects ON ((subjects.id = certification_subject_unlocks.subject_id)))
          GROUP BY subjects.id
        )
 SELECT users.id AS user_id,
    subjects_unlocked.subject_id
   FROM ((upchieve.users
     JOIN upchieve.volunteer_profiles vp ON ((vp.user_id = users.id)))
     LEFT JOIN ( SELECT sub_unlocked.user_id,
            sub_unlocked.subject AS subject_id
           FROM ( SELECT users_certifications.user_id,
                    subjects.id AS subject
                   FROM (((upchieve.users_certifications
                     JOIN upchieve.certification_subject_unlocks USING (certification_id))
                     JOIN upchieve.subjects ON ((certification_subject_unlocks.subject_id = subjects.id)))
                     JOIN subject_totals ON ((subject_totals.id = subjects.id)))
                  GROUP BY users_certifications.user_id, subjects.id, subject_totals.total
                 HAVING ((count(*))::integer >= subject_totals.total)) sub_unlocked
          GROUP BY sub_unlocked.user_id, sub_unlocked.subject) subjects_unlocked ON ((subjects_unlocked.user_id = users.id)))
  WHERE (subjects_unlocked.* IS NOT NULL)
  WITH NO DATA;


--
-- Name: users_surveys; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_surveys (
    id uuid NOT NULL,
    survey_id integer NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    survey_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_surveys_submissions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_surveys_submissions (
    user_survey_id uuid NOT NULL,
    survey_question_id integer NOT NULL,
    survey_response_choice_id integer,
    open_response text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_training_courses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_training_courses (
    user_id uuid NOT NULL,
    training_course_id integer NOT NULL,
    complete boolean DEFAULT false NOT NULL,
    progress smallint DEFAULT 0 NOT NULL,
    completed_materials text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_training_courses_progress_check CHECK ((progress >= 0)),
    CONSTRAINT users_training_courses_progress_check1 CHECK ((progress <= 100))
);


--
-- Name: users_volunteer_partner_orgs_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_volunteer_partner_orgs_instances (
    user_id uuid,
    volunteer_partner_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_occupations; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_occupations (
    user_id uuid NOT NULL,
    occupation text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_partner_orgs; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_partner_orgs (
    id uuid NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    receive_weekly_hour_summary_email boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_partner_orgs_upchieve_instances; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_partner_orgs_upchieve_instances (
    id uuid NOT NULL,
    volunteer_partner_org_id uuid,
    deactivated_on timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_reference_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_reference_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_reference_statuses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.volunteer_reference_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_reference_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.volunteer_reference_statuses_id_seq OWNED BY upchieve.volunteer_reference_statuses.id;


--
-- Name: volunteer_references; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.volunteer_references (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    status_id integer,
    sent_at timestamp without time zone,
    affiliation text,
    relationship_length text,
    patient smallint,
    positive_role_model smallint,
    agreeable_and_approachable smallint,
    communicates_effectively smallint,
    rejection_reason text,
    additional_info text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    trustworthy_with_children smallint
);


--
-- Name: weekdays; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.weekdays (
    id integer NOT NULL,
    day text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: weekdays_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.weekdays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: weekdays_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.weekdays_id_seq OWNED BY upchieve.weekdays.id;


--
-- Name: ban_reasons id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ban_reasons ALTER COLUMN id SET DEFAULT nextval('upchieve.ban_reasons_id_seq'::regclass);


--
-- Name: certifications id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certifications ALTER COLUMN id SET DEFAULT nextval('upchieve.certifications_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.cities ALTER COLUMN id SET DEFAULT nextval('upchieve.cities_id_seq'::regclass);


--
-- Name: grade_levels id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.grade_levels ALTER COLUMN id SET DEFAULT nextval('upchieve.grade_levels_id_seq'::regclass);


--
-- Name: ip_addresses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ip_addresses ALTER COLUMN id SET DEFAULT nextval('upchieve.ip_addresses_id_seq'::regclass);


--
-- Name: notification_methods id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_methods ALTER COLUMN id SET DEFAULT nextval('upchieve.notification_methods_id_seq'::regclass);


--
-- Name: notification_priority_groups id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_priority_groups ALTER COLUMN id SET DEFAULT nextval('upchieve.notification_priority_groups_id_seq'::regclass);


--
-- Name: notification_types id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_types ALTER COLUMN id SET DEFAULT nextval('upchieve.notification_types_id_seq'::regclass);


--
-- Name: photo_id_statuses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.photo_id_statuses ALTER COLUMN id SET DEFAULT nextval('upchieve.photo_id_statuses_id_seq'::regclass);


--
-- Name: progress_report_analysis_types id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_analysis_types ALTER COLUMN id SET DEFAULT nextval('upchieve.progress_report_analysis_types_id_seq'::regclass);


--
-- Name: progress_report_focus_areas id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_focus_areas ALTER COLUMN id SET DEFAULT nextval('upchieve.progress_report_focus_areas_id_seq'::regclass);


--
-- Name: progress_report_info_types id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_info_types ALTER COLUMN id SET DEFAULT nextval('upchieve.progress_report_info_types_id_seq'::regclass);


--
-- Name: progress_report_statuses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_statuses ALTER COLUMN id SET DEFAULT nextval('upchieve.progress_report_statuses_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_questions ALTER COLUMN id SET DEFAULT nextval('upchieve.quiz_questions_id_seq'::regclass);


--
-- Name: quiz_subcategories id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_subcategories ALTER COLUMN id SET DEFAULT nextval('upchieve.quiz_subcategories_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quizzes ALTER COLUMN id SET DEFAULT nextval('upchieve.quizzes_id_seq'::regclass);


--
-- Name: report_reasons id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.report_reasons ALTER COLUMN id SET DEFAULT nextval('upchieve.report_reasons_id_seq'::regclass);


--
-- Name: session_flags id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_flags ALTER COLUMN id SET DEFAULT nextval('upchieve.session_flags_id_seq'::regclass);


--
-- Name: signup_sources id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.signup_sources ALTER COLUMN id SET DEFAULT nextval('upchieve.signup_sources_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.subjects ALTER COLUMN id SET DEFAULT nextval('upchieve.subjects_id_seq'::regclass);


--
-- Name: tool_types id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tool_types ALTER COLUMN id SET DEFAULT nextval('upchieve.tool_types_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.topics ALTER COLUMN id SET DEFAULT nextval('upchieve.topics_id_seq'::regclass);


--
-- Name: training_courses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.training_courses ALTER COLUMN id SET DEFAULT nextval('upchieve.training_courses_id_seq'::regclass);


--
-- Name: user_actions id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions ALTER COLUMN id SET DEFAULT nextval('upchieve.user_actions_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_roles ALTER COLUMN id SET DEFAULT nextval('upchieve.user_roles_id_seq'::regclass);


--
-- Name: volunteer_reference_statuses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_reference_statuses ALTER COLUMN id SET DEFAULT nextval('upchieve.volunteer_reference_statuses_id_seq'::regclass);


--
-- Name: weekdays id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.weekdays ALTER COLUMN id SET DEFAULT nextval('upchieve.weekdays_id_seq'::regclass);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: admin_profiles admin_profiles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.admin_profiles
    ADD CONSTRAINT admin_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: assistments_data assistments_data_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assistments_data
    ADD CONSTRAINT assistments_data_mongo_id_key UNIQUE (mongo_id);


--
-- Name: assistments_data assistments_data_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assistments_data
    ADD CONSTRAINT assistments_data_pkey PRIMARY KEY (id);


--
-- Name: associated_partners associated_partners_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.associated_partners
    ADD CONSTRAINT associated_partners_pkey PRIMARY KEY (id);


--
-- Name: availabilities availabilities_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availabilities
    ADD CONSTRAINT availabilities_pkey PRIMARY KEY (id);


--
-- Name: availability_histories availability_histories_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availability_histories
    ADD CONSTRAINT availability_histories_pkey PRIMARY KEY (id);


--
-- Name: ban_reasons ban_reasons_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ban_reasons
    ADD CONSTRAINT ban_reasons_name_key UNIQUE (name);


--
-- Name: ban_reasons ban_reasons_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ban_reasons
    ADD CONSTRAINT ban_reasons_pkey PRIMARY KEY (id);


--
-- Name: certification_subject_unlocks certification_subject_unlocks_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certification_subject_unlocks
    ADD CONSTRAINT certification_subject_unlocks_pkey PRIMARY KEY (subject_id, certification_id);


--
-- Name: certifications certifications_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certifications
    ADD CONSTRAINT certifications_name_key UNIQUE (name);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: computed_subject_unlocks computed_subject_unlocks_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.computed_subject_unlocks
    ADD CONSTRAINT computed_subject_unlocks_pkey PRIMARY KEY (subject_id, certification_id);


--
-- Name: contact_form_submissions contact_form_submissions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.contact_form_submissions
    ADD CONSTRAINT contact_form_submissions_pkey PRIMARY KEY (id);


--
-- Name: federated_credentials federated_credentials_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.federated_credentials
    ADD CONSTRAINT federated_credentials_pkey PRIMARY KEY (id, issuer);


--
-- Name: feedbacks feedbacks_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_mongo_id_key UNIQUE (mongo_id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: grade_levels grade_levels_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.grade_levels
    ADD CONSTRAINT grade_levels_name_key UNIQUE (name);


--
-- Name: grade_levels grade_levels_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.grade_levels
    ADD CONSTRAINT grade_levels_pkey PRIMARY KEY (id);


--
-- Name: ineligible_students ineligible_students_email_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_email_key UNIQUE (email);


--
-- Name: ineligible_students ineligible_students_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_mongo_id_key UNIQUE (mongo_id);


--
-- Name: ineligible_students ineligible_students_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_pkey PRIMARY KEY (id);


--
-- Name: ip_addresses ip_addresses_ip_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ip_addresses
    ADD CONSTRAINT ip_addresses_ip_key UNIQUE (ip);


--
-- Name: ip_addresses ip_addresses_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ip_addresses
    ADD CONSTRAINT ip_addresses_mongo_id_key UNIQUE (mongo_id);


--
-- Name: ip_addresses ip_addresses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ip_addresses
    ADD CONSTRAINT ip_addresses_pkey PRIMARY KEY (id);


--
-- Name: legacy_availability_histories legacy_availability_histories_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.legacy_availability_histories
    ADD CONSTRAINT legacy_availability_histories_pkey PRIMARY KEY (id);


--
-- Name: muted_users_subject_alerts muted_users_subject_alerts_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.muted_users_subject_alerts
    ADD CONSTRAINT muted_users_subject_alerts_pkey PRIMARY KEY (user_id, subject_id);


--
-- Name: quiz_subcategories name_quiz_id; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_subcategories
    ADD CONSTRAINT name_quiz_id UNIQUE (name, quiz_id);


--
-- Name: notification_methods notification_methods_method_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_methods
    ADD CONSTRAINT notification_methods_method_key UNIQUE (method);


--
-- Name: notification_methods notification_methods_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_methods
    ADD CONSTRAINT notification_methods_pkey PRIMARY KEY (id);


--
-- Name: notification_priority_groups notification_priority_groups_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_priority_groups
    ADD CONSTRAINT notification_priority_groups_name_key UNIQUE (name);


--
-- Name: notification_priority_groups notification_priority_groups_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_priority_groups
    ADD CONSTRAINT notification_priority_groups_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_type_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notification_types
    ADD CONSTRAINT notification_types_type_key UNIQUE (type);


--
-- Name: notifications notifications_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_mongo_id_key UNIQUE (mongo_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parents_guardians parents_guardians_email_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.parents_guardians
    ADD CONSTRAINT parents_guardians_email_key UNIQUE (email);


--
-- Name: parents_guardians parents_guardians_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.parents_guardians
    ADD CONSTRAINT parents_guardians_pkey PRIMARY KEY (id);


--
-- Name: parents_guardians_students parents_guardians_students_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.parents_guardians_students
    ADD CONSTRAINT parents_guardians_students_pkey PRIMARY KEY (parents_guardians_id, students_id);


--
-- Name: photo_id_statuses photo_id_statuses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.photo_id_statuses
    ADD CONSTRAINT photo_id_statuses_name_key UNIQUE (name);


--
-- Name: photo_id_statuses photo_id_statuses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.photo_id_statuses
    ADD CONSTRAINT photo_id_statuses_pkey PRIMARY KEY (id);


--
-- Name: postal_codes postal_codes_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.postal_codes
    ADD CONSTRAINT postal_codes_pkey PRIMARY KEY (code);


--
-- Name: pre_session_surveys pre_session_surveys_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.pre_session_surveys
    ADD CONSTRAINT pre_session_surveys_mongo_id_key UNIQUE (mongo_id);


--
-- Name: pre_session_surveys pre_session_surveys_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.pre_session_surveys
    ADD CONSTRAINT pre_session_surveys_pkey PRIMARY KEY (id);


--
-- Name: pre_session_surveys pre_session_surveys_session_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.pre_session_surveys
    ADD CONSTRAINT pre_session_surveys_session_id_key UNIQUE (session_id);


--
-- Name: progress_report_analysis_types progress_report_analysis_types_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_analysis_types
    ADD CONSTRAINT progress_report_analysis_types_name_key UNIQUE (name);


--
-- Name: progress_report_analysis_types progress_report_analysis_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_analysis_types
    ADD CONSTRAINT progress_report_analysis_types_pkey PRIMARY KEY (id);


--
-- Name: progress_report_concept_details progress_report_concept_details_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concept_details
    ADD CONSTRAINT progress_report_concept_details_pkey PRIMARY KEY (id);


--
-- Name: progress_report_concepts progress_report_concepts_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concepts
    ADD CONSTRAINT progress_report_concepts_pkey PRIMARY KEY (id);


--
-- Name: progress_report_focus_areas progress_report_focus_areas_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_focus_areas
    ADD CONSTRAINT progress_report_focus_areas_name_key UNIQUE (name);


--
-- Name: progress_report_focus_areas progress_report_focus_areas_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_focus_areas
    ADD CONSTRAINT progress_report_focus_areas_pkey PRIMARY KEY (id);


--
-- Name: progress_report_info_types progress_report_info_types_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_info_types
    ADD CONSTRAINT progress_report_info_types_name_key UNIQUE (name);


--
-- Name: progress_report_info_types progress_report_info_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_info_types
    ADD CONSTRAINT progress_report_info_types_pkey PRIMARY KEY (id);


--
-- Name: progress_report_sessions progress_report_sessions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_sessions
    ADD CONSTRAINT progress_report_sessions_pkey PRIMARY KEY (progress_report_id, session_id, progress_report_analysis_type_id);


--
-- Name: progress_report_statuses progress_report_statuses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_statuses
    ADD CONSTRAINT progress_report_statuses_name_key UNIQUE (name);


--
-- Name: progress_report_statuses progress_report_statuses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_statuses
    ADD CONSTRAINT progress_report_statuses_pkey PRIMARY KEY (id);


--
-- Name: progress_report_summaries progress_report_summaries_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summaries
    ADD CONSTRAINT progress_report_summaries_pkey PRIMARY KEY (id);


--
-- Name: progress_report_summary_details progress_report_summary_details_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summary_details
    ADD CONSTRAINT progress_report_summary_details_pkey PRIMARY KEY (id);


--
-- Name: progress_reports progress_reports_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_reports
    ADD CONSTRAINT progress_reports_pkey PRIMARY KEY (id);


--
-- Name: push_tokens push_tokens_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.push_tokens
    ADD CONSTRAINT push_tokens_pkey PRIMARY KEY (id);


--
-- Name: question_tags question_tags_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.question_tags
    ADD CONSTRAINT question_tags_pkey PRIMARY KEY (id);


--
-- Name: question_types question_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.question_types
    ADD CONSTRAINT question_types_pkey PRIMARY KEY (id);


--
-- Name: quiz_certification_grants quiz_certification_grants_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_certification_grants
    ADD CONSTRAINT quiz_certification_grants_pkey PRIMARY KEY (certification_id, quiz_id);


--
-- Name: quiz_questions quiz_questions_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_questions
    ADD CONSTRAINT quiz_questions_mongo_id_key UNIQUE (mongo_id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_review_materials quiz_review_materials_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_review_materials
    ADD CONSTRAINT quiz_review_materials_pkey PRIMARY KEY (id);


--
-- Name: quiz_subcategories quiz_subcategories_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_subcategories
    ADD CONSTRAINT quiz_subcategories_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quizzes
    ADD CONSTRAINT quizzes_name_key UNIQUE (name);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: report_reasons report_reasons_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.report_reasons
    ADD CONSTRAINT report_reasons_pkey PRIMARY KEY (id);


--
-- Name: report_reasons report_reasons_reason_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.report_reasons
    ADD CONSTRAINT report_reasons_reason_key UNIQUE (reason);


--
-- Name: required_email_domains required_email_domains_domain_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.required_email_domains
    ADD CONSTRAINT required_email_domains_domain_key UNIQUE (domain);


--
-- Name: required_email_domains required_email_domains_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.required_email_domains
    ADD CONSTRAINT required_email_domains_pkey PRIMARY KEY (id);


--
-- Name: school_nces_metadata school_nces_metadata_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.school_nces_metadata
    ADD CONSTRAINT school_nces_metadata_pkey PRIMARY KEY (school_id);


--
-- Name: schools schools_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools
    ADD CONSTRAINT schools_mongo_id_key UNIQUE (mongo_id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: schools_sponsor_orgs schools_sponsor_orgs_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools_sponsor_orgs
    ADD CONSTRAINT schools_sponsor_orgs_pkey PRIMARY KEY (school_id, sponsor_org_id);


--
-- Name: session_flags session_flags_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_flags
    ADD CONSTRAINT session_flags_name_key UNIQUE (name);


--
-- Name: session_flags session_flags_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_flags
    ADD CONSTRAINT session_flags_pkey PRIMARY KEY (id);


--
-- Name: session_messages session_messages_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_messages
    ADD CONSTRAINT session_messages_mongo_id_key UNIQUE (mongo_id);


--
-- Name: session_messages session_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_messages
    ADD CONSTRAINT session_messages_pkey PRIMARY KEY (id);


--
-- Name: session_reports session_reports_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_reports
    ADD CONSTRAINT session_reports_pkey PRIMARY KEY (id);


--
-- Name: session_review_reasons session_review_reasons_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_review_reasons
    ADD CONSTRAINT session_review_reasons_pkey PRIMARY KEY (session_id, session_flag_id);


--
-- Name: sessions sessions_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_mongo_id_key UNIQUE (mongo_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions_session_flags sessions_session_flags_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions_session_flags
    ADD CONSTRAINT sessions_session_flags_pkey PRIMARY KEY (session_id, session_flag_id);


--
-- Name: signup_sources signup_sources_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.signup_sources
    ADD CONSTRAINT signup_sources_name_key UNIQUE (name);


--
-- Name: signup_sources signup_sources_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.signup_sources
    ADD CONSTRAINT signup_sources_pkey PRIMARY KEY (id);


--
-- Name: sponsor_orgs sponsor_orgs_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sponsor_orgs
    ADD CONSTRAINT sponsor_orgs_pkey PRIMARY KEY (id);


--
-- Name: sponsor_orgs_upchieve_instances sponsor_orgs_upchieve_instances_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sponsor_orgs_upchieve_instances
    ADD CONSTRAINT sponsor_orgs_upchieve_instances_pkey PRIMARY KEY (id);


--
-- Name: student_favorite_volunteers student_favorite_volunteers_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_favorite_volunteers
    ADD CONSTRAINT student_favorite_volunteers_pkey PRIMARY KEY (student_id, volunteer_id);


--
-- Name: student_partner_org_sites student_partner_org_sites_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_org_sites
    ADD CONSTRAINT student_partner_org_sites_name_key UNIQUE (name);


--
-- Name: student_partner_org_sites student_partner_org_sites_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_org_sites
    ADD CONSTRAINT student_partner_org_sites_pkey PRIMARY KEY (id);


--
-- Name: student_partner_orgs student_partner_orgs_key_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs
    ADD CONSTRAINT student_partner_orgs_key_key UNIQUE (key);


--
-- Name: student_partner_orgs student_partner_orgs_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs
    ADD CONSTRAINT student_partner_orgs_name_key UNIQUE (name);


--
-- Name: student_partner_orgs student_partner_orgs_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs
    ADD CONSTRAINT student_partner_orgs_pkey PRIMARY KEY (id);


--
-- Name: student_partner_orgs student_partner_orgs_signup_code_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs
    ADD CONSTRAINT student_partner_orgs_signup_code_key UNIQUE (signup_code);


--
-- Name: student_partner_orgs_sponsor_orgs student_partner_orgs_sponsor_orgs_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_sponsor_orgs
    ADD CONSTRAINT student_partner_orgs_sponsor_orgs_pkey PRIMARY KEY (student_partner_org_id, sponsor_org_id);


--
-- Name: student_partner_orgs_upchieve_instances student_partner_orgs_upchieve_instances_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_upchieve_instances
    ADD CONSTRAINT student_partner_orgs_upchieve_instances_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: subjects subjects_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.subjects
    ADD CONSTRAINT subjects_name_key UNIQUE (name);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: users_surveys survey_id_user_id_session_id_survey_type_id; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT survey_id_user_id_session_id_survey_type_id UNIQUE (survey_id, user_id, session_id, survey_type_id);


--
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (id);


--
-- Name: survey_questions_question_tags survey_questions_question_tags_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions_question_tags
    ADD CONSTRAINT survey_questions_question_tags_pkey PRIMARY KEY (id);


--
-- Name: survey_response_choices survey_response_choices_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_response_choices
    ADD CONSTRAINT survey_response_choices_pkey PRIMARY KEY (id);


--
-- Name: survey_types survey_types_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_types
    ADD CONSTRAINT survey_types_name_key UNIQUE (name);


--
-- Name: survey_types survey_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_types
    ADD CONSTRAINT survey_types_pkey PRIMARY KEY (id);


--
-- Name: surveys surveys_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys
    ADD CONSTRAINT surveys_name_key UNIQUE (name);


--
-- Name: surveys surveys_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys
    ADD CONSTRAINT surveys_pkey PRIMARY KEY (id);


--
-- Name: surveys_survey_questions surveys_survey_questions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_pkey PRIMARY KEY (id);


--
-- Name: tool_types tool_types_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tool_types
    ADD CONSTRAINT tool_types_name_key UNIQUE (name);


--
-- Name: tool_types tool_types_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tool_types
    ADD CONSTRAINT tool_types_pkey PRIMARY KEY (id);


--
-- Name: topics topics_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.topics
    ADD CONSTRAINT topics_name_key UNIQUE (name);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: training_courses training_courses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.training_courses
    ADD CONSTRAINT training_courses_name_key UNIQUE (name);


--
-- Name: training_courses training_courses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.training_courses
    ADD CONSTRAINT training_courses_pkey PRIMARY KEY (id);


--
-- Name: cities unique_city_name_state; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.cities
    ADD CONSTRAINT unique_city_name_state UNIQUE (name, us_state_code);


--
-- Name: users_ip_addresses unique_user_id_ip_address_id; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_ip_addresses
    ADD CONSTRAINT unique_user_id_ip_address_id UNIQUE (user_id, ip_address_id);


--
-- Name: volunteer_occupations unique_user_id_occupation; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_occupations
    ADD CONSTRAINT unique_user_id_occupation UNIQUE (user_id, occupation);


--
-- Name: us_states us_states_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.us_states
    ADD CONSTRAINT us_states_name_key UNIQUE (name);


--
-- Name: us_states us_states_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.us_states
    ADD CONSTRAINT us_states_pkey PRIMARY KEY (code);


--
-- Name: user_actions user_actions_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions
    ADD CONSTRAINT user_actions_mongo_id_key UNIQUE (mongo_id);


--
-- Name: user_actions user_actions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions
    ADD CONSTRAINT user_actions_pkey PRIMARY KEY (id);


--
-- Name: push_tokens user_id_token; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.push_tokens
    ADD CONSTRAINT user_id_token UNIQUE (user_id, token);


--
-- Name: users_training_courses user_id_training_course_id_unique; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_training_courses
    ADD CONSTRAINT user_id_training_course_id_unique UNIQUE (user_id, training_course_id);


--
-- Name: user_product_flags user_product_flags_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_product_flags
    ADD CONSTRAINT user_product_flags_pkey PRIMARY KEY (user_id);


--
-- Name: user_roles user_roles_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_roles
    ADD CONSTRAINT user_roles_name_key UNIQUE (name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_session_metrics user_session_metrics_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_session_metrics
    ADD CONSTRAINT user_session_metrics_pkey PRIMARY KEY (user_id);


--
-- Name: users_certifications users_certifications_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_certifications
    ADD CONSTRAINT users_certifications_pkey PRIMARY KEY (user_id, certification_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_ip_addresses users_ip_addresses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_ip_addresses
    ADD CONSTRAINT users_ip_addresses_pkey PRIMARY KEY (id);


--
-- Name: users users_mongo_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_mongo_id_key UNIQUE (mongo_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_quizzes users_quizzes_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_quizzes
    ADD CONSTRAINT users_quizzes_pkey PRIMARY KEY (user_id, quiz_id);


--
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- Name: users_roles users_roles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_roles
    ADD CONSTRAINT users_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users_surveys users_surveys_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT users_surveys_pkey PRIMARY KEY (id);


--
-- Name: users_training_courses users_training_courses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_training_courses
    ADD CONSTRAINT users_training_courses_pkey PRIMARY KEY (user_id, training_course_id);


--
-- Name: volunteer_partner_orgs volunteer_partner_orgs_key_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_partner_orgs
    ADD CONSTRAINT volunteer_partner_orgs_key_key UNIQUE (key);


--
-- Name: volunteer_partner_orgs volunteer_partner_orgs_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_partner_orgs
    ADD CONSTRAINT volunteer_partner_orgs_name_key UNIQUE (name);


--
-- Name: volunteer_partner_orgs volunteer_partner_orgs_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_partner_orgs
    ADD CONSTRAINT volunteer_partner_orgs_pkey PRIMARY KEY (id);


--
-- Name: volunteer_partner_orgs_upchieve_instances volunteer_partner_orgs_upchieve_instances_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_partner_orgs_upchieve_instances
    ADD CONSTRAINT volunteer_partner_orgs_upchieve_instances_pkey PRIMARY KEY (id);


--
-- Name: volunteer_profiles volunteer_profiles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: volunteer_reference_statuses volunteer_reference_statuses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_reference_statuses
    ADD CONSTRAINT volunteer_reference_statuses_name_key UNIQUE (name);


--
-- Name: volunteer_reference_statuses volunteer_reference_statuses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_reference_statuses
    ADD CONSTRAINT volunteer_reference_statuses_pkey PRIMARY KEY (id);


--
-- Name: volunteer_references volunteer_references_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_references
    ADD CONSTRAINT volunteer_references_pkey PRIMARY KEY (id);


--
-- Name: weekdays weekdays_day_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.weekdays
    ADD CONSTRAINT weekdays_day_key UNIQUE (day);


--
-- Name: weekdays weekdays_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.weekdays
    ADD CONSTRAINT weekdays_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX "IDX_session_expire" ON auth.session USING btree (expire);


--
-- Name: availability_histories_user_id_recorded_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX availability_histories_user_id_recorded_at ON upchieve.availability_histories USING btree (user_id, recorded_at);


--
-- Name: feedbacks_session_id_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX feedbacks_session_id_user_id ON upchieve.feedbacks USING btree (session_id, user_id);


--
-- Name: legacy_availability_histories_user_id_recorded_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX legacy_availability_histories_user_id_recorded_at ON upchieve.legacy_availability_histories USING btree (user_id, recorded_at);


--
-- Name: notifications_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX notifications_user_id ON upchieve.notifications USING btree (user_id);


--
-- Name: progress_report_concept_details_concept_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_concept_details_concept_id ON upchieve.progress_report_concept_details USING btree (progress_report_concept_id);


--
-- Name: progress_report_concepts_progress_report_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_concepts_progress_report_id ON upchieve.progress_report_concepts USING btree (progress_report_id);


--
-- Name: progress_report_sessions_analysis_type_created_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_sessions_analysis_type_created_at ON upchieve.progress_report_sessions USING btree (progress_report_analysis_type_id, created_at);


--
-- Name: progress_report_sessions_progress_report_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_sessions_progress_report_id ON upchieve.progress_report_sessions USING btree (progress_report_id);


--
-- Name: progress_report_sessions_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_sessions_session_id ON upchieve.progress_report_sessions USING btree (session_id);


--
-- Name: progress_report_summaries_progress_report_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_summaries_progress_report_id ON upchieve.progress_report_summaries USING btree (progress_report_id);


--
-- Name: progress_report_summary_details_report_summary_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_summary_details_report_summary_id ON upchieve.progress_report_summary_details USING btree (progress_report_summary_id);


--
-- Name: progress_reports_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_reports_user_id ON upchieve.progress_reports USING btree (user_id);


--
-- Name: school_name_search; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX school_name_search ON upchieve.schools USING gin (name public.gin_trgm_ops);


--
-- Name: session_messages_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_messages_session_id ON upchieve.session_messages USING btree (session_id);


--
-- Name: session_reports_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_reports_session_id ON upchieve.session_reports USING btree (session_id);


--
-- Name: session_review_reasons_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_review_reasons_session_id ON upchieve.session_review_reasons USING btree (session_id);


--
-- Name: sessions_student_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_student_id ON upchieve.sessions USING btree (student_id);


--
-- Name: sessions_volunteer_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_volunteer_id ON upchieve.sessions USING btree (volunteer_id);


--
-- Name: survey_questions_response_choices_response_survey_question; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX survey_questions_response_choices_response_survey_question ON upchieve.survey_questions_response_choices USING btree (response_choice_id, surveys_survey_question_id);


--
-- Name: user_actions_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX user_actions_user_id ON upchieve.user_actions USING btree (user_id);


--
-- Name: volunteer_partner_orgs_key; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX volunteer_partner_orgs_key ON upchieve.volunteer_partner_orgs USING btree (key);


--
-- Name: users_certifications update_users_subjects; Type: TRIGGER; Schema: upchieve; Owner: -
--

CREATE TRIGGER update_users_subjects AFTER INSERT OR DELETE OR UPDATE ON upchieve.users_certifications FOR EACH ROW EXECUTE FUNCTION upchieve.refresh_users_subjects_mview();


--
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: assistments_data assistments_data_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assistments_data
    ADD CONSTRAINT assistments_data_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: associated_partners associated_partners_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.associated_partners
    ADD CONSTRAINT associated_partners_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: associated_partners associated_partners_student_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.associated_partners
    ADD CONSTRAINT associated_partners_student_sponsor_org_id_fkey FOREIGN KEY (student_sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: associated_partners associated_partners_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.associated_partners
    ADD CONSTRAINT associated_partners_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: availabilities availabilities_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availabilities
    ADD CONSTRAINT availabilities_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: availabilities availabilities_weekday_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availabilities
    ADD CONSTRAINT availabilities_weekday_id_fkey FOREIGN KEY (weekday_id) REFERENCES upchieve.weekdays(id);


--
-- Name: availability_histories availability_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availability_histories
    ADD CONSTRAINT availability_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: availability_histories availability_histories_weekday_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.availability_histories
    ADD CONSTRAINT availability_histories_weekday_id_fkey FOREIGN KEY (weekday_id) REFERENCES upchieve.weekdays(id);


--
-- Name: certification_subject_unlocks certification_subject_unlocks_certification_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certification_subject_unlocks
    ADD CONSTRAINT certification_subject_unlocks_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES upchieve.certifications(id);


--
-- Name: certification_subject_unlocks certification_subject_unlocks_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.certification_subject_unlocks
    ADD CONSTRAINT certification_subject_unlocks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: cities cities_us_state_code_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.cities
    ADD CONSTRAINT cities_us_state_code_fkey FOREIGN KEY (us_state_code) REFERENCES upchieve.us_states(code);


--
-- Name: computed_subject_unlocks computed_subject_unlocks_certification_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.computed_subject_unlocks
    ADD CONSTRAINT computed_subject_unlocks_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES upchieve.certifications(id);


--
-- Name: computed_subject_unlocks computed_subject_unlocks_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.computed_subject_unlocks
    ADD CONSTRAINT computed_subject_unlocks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: contact_form_submissions contact_form_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.contact_form_submissions
    ADD CONSTRAINT contact_form_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: federated_credentials federated_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.federated_credentials
    ADD CONSTRAINT federated_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: feedbacks feedbacks_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: feedbacks feedbacks_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: feedbacks feedbacks_topic_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES upchieve.topics(id);


--
-- Name: feedbacks feedbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: feedbacks feedbacks_user_role_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.feedbacks
    ADD CONSTRAINT feedbacks_user_role_id_fkey FOREIGN KEY (user_role_id) REFERENCES upchieve.user_roles(id);


--
-- Name: ineligible_students ineligible_students_grade_level_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_grade_level_id_fkey FOREIGN KEY (grade_level_id) REFERENCES upchieve.grade_levels(id);


--
-- Name: ineligible_students ineligible_students_ip_address_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_ip_address_id_fkey FOREIGN KEY (ip_address_id) REFERENCES upchieve.ip_addresses(id);


--
-- Name: ineligible_students ineligible_students_postal_code_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_postal_code_fkey FOREIGN KEY (postal_code) REFERENCES upchieve.postal_codes(code);


--
-- Name: ineligible_students ineligible_students_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ineligible_students
    ADD CONSTRAINT ineligible_students_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: legacy_availability_histories legacy_availability_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.legacy_availability_histories
    ADD CONSTRAINT legacy_availability_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: muted_users_subject_alerts muted_users_subject_alerts_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.muted_users_subject_alerts
    ADD CONSTRAINT muted_users_subject_alerts_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: muted_users_subject_alerts muted_users_subject_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.muted_users_subject_alerts
    ADD CONSTRAINT muted_users_subject_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: notifications notifications_method_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_method_id_fkey FOREIGN KEY (method_id) REFERENCES upchieve.notification_methods(id);


--
-- Name: notifications notifications_priority_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_priority_group_id_fkey FOREIGN KEY (priority_group_id) REFERENCES upchieve.notification_priority_groups(id);


--
-- Name: notifications notifications_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: notifications notifications_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_type_id_fkey FOREIGN KEY (type_id) REFERENCES upchieve.notification_types(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: parents_guardians_students parents_guardians_students_parents_guardians_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.parents_guardians_students
    ADD CONSTRAINT parents_guardians_students_parents_guardians_id_fkey FOREIGN KEY (parents_guardians_id) REFERENCES upchieve.parents_guardians(id);


--
-- Name: parents_guardians_students parents_guardians_students_students_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.parents_guardians_students
    ADD CONSTRAINT parents_guardians_students_students_id_fkey FOREIGN KEY (students_id) REFERENCES upchieve.student_profiles(user_id);


--
-- Name: postal_codes postal_codes_us_state_code_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.postal_codes
    ADD CONSTRAINT postal_codes_us_state_code_fkey FOREIGN KEY (us_state_code) REFERENCES upchieve.us_states(code);


--
-- Name: pre_session_surveys pre_session_surveys_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.pre_session_surveys
    ADD CONSTRAINT pre_session_surveys_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: pre_session_surveys pre_session_surveys_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.pre_session_surveys
    ADD CONSTRAINT pre_session_surveys_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: progress_report_concept_details progress_report_concept_detai_progress_report_focus_area_i_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concept_details
    ADD CONSTRAINT progress_report_concept_detai_progress_report_focus_area_i_fkey FOREIGN KEY (progress_report_focus_area_id) REFERENCES upchieve.progress_report_focus_areas(id);


--
-- Name: progress_report_concept_details progress_report_concept_detai_progress_report_info_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concept_details
    ADD CONSTRAINT progress_report_concept_detai_progress_report_info_type_id_fkey FOREIGN KEY (progress_report_info_type_id) REFERENCES upchieve.progress_report_info_types(id);


--
-- Name: progress_report_concept_details progress_report_concept_details_progress_report_concept_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concept_details
    ADD CONSTRAINT progress_report_concept_details_progress_report_concept_id_fkey FOREIGN KEY (progress_report_concept_id) REFERENCES upchieve.progress_report_concepts(id);


--
-- Name: progress_report_concepts progress_report_concepts_progress_report_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_concepts
    ADD CONSTRAINT progress_report_concepts_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports(id);


--
-- Name: progress_report_sessions progress_report_sessions_progress_report_analysis_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_sessions
    ADD CONSTRAINT progress_report_sessions_progress_report_analysis_type_id_fkey FOREIGN KEY (progress_report_analysis_type_id) REFERENCES upchieve.progress_report_analysis_types(id);


--
-- Name: progress_report_sessions progress_report_sessions_progress_report_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_sessions
    ADD CONSTRAINT progress_report_sessions_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports(id);


--
-- Name: progress_report_sessions progress_report_sessions_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_sessions
    ADD CONSTRAINT progress_report_sessions_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: progress_report_summaries progress_report_summaries_progress_report_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summaries
    ADD CONSTRAINT progress_report_summaries_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports(id);


--
-- Name: progress_report_summary_details progress_report_summary_detai_progress_report_focus_area_i_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summary_details
    ADD CONSTRAINT progress_report_summary_detai_progress_report_focus_area_i_fkey FOREIGN KEY (progress_report_focus_area_id) REFERENCES upchieve.progress_report_focus_areas(id);


--
-- Name: progress_report_summary_details progress_report_summary_detai_progress_report_info_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summary_details
    ADD CONSTRAINT progress_report_summary_detai_progress_report_info_type_id_fkey FOREIGN KEY (progress_report_info_type_id) REFERENCES upchieve.progress_report_info_types(id);


--
-- Name: progress_report_summary_details progress_report_summary_details_progress_report_summary_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_summary_details
    ADD CONSTRAINT progress_report_summary_details_progress_report_summary_id_fkey FOREIGN KEY (progress_report_summary_id) REFERENCES upchieve.progress_report_summaries(id);


--
-- Name: progress_reports progress_reports_status_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_reports
    ADD CONSTRAINT progress_reports_status_id_fkey FOREIGN KEY (status_id) REFERENCES upchieve.progress_report_statuses(id);


--
-- Name: progress_reports progress_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_reports
    ADD CONSTRAINT progress_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: push_tokens push_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.push_tokens
    ADD CONSTRAINT push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: quiz_certification_grants quiz_certification_grants_certification_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_certification_grants
    ADD CONSTRAINT quiz_certification_grants_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES upchieve.certifications(id);


--
-- Name: quiz_certification_grants quiz_certification_grants_quiz_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_certification_grants
    ADD CONSTRAINT quiz_certification_grants_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES upchieve.quizzes(id);


--
-- Name: quiz_questions quiz_questions_quiz_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_subcategory_id_fkey FOREIGN KEY (quiz_subcategory_id) REFERENCES upchieve.quiz_subcategories(id);


--
-- Name: quiz_review_materials quiz_review_materials_quiz_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_review_materials
    ADD CONSTRAINT quiz_review_materials_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES upchieve.quizzes(id);


--
-- Name: quiz_subcategories quiz_subcategories_quiz_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.quiz_subcategories
    ADD CONSTRAINT quiz_subcategories_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES upchieve.quizzes(id);


--
-- Name: required_email_domains required_email_domains_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.required_email_domains
    ADD CONSTRAINT required_email_domains_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: school_nces_metadata school_nces_metadata_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.school_nces_metadata
    ADD CONSTRAINT school_nces_metadata_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: schools schools_city_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools
    ADD CONSTRAINT schools_city_id_fkey FOREIGN KEY (city_id) REFERENCES upchieve.cities(id);


--
-- Name: schools_sponsor_orgs_instances schools_sponsor_orgs_instances_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools_sponsor_orgs_instances
    ADD CONSTRAINT schools_sponsor_orgs_instances_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: schools_sponsor_orgs_instances schools_sponsor_orgs_instances_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools_sponsor_orgs_instances
    ADD CONSTRAINT schools_sponsor_orgs_instances_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: schools_sponsor_orgs schools_sponsor_orgs_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools_sponsor_orgs
    ADD CONSTRAINT schools_sponsor_orgs_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: schools_sponsor_orgs schools_sponsor_orgs_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.schools_sponsor_orgs
    ADD CONSTRAINT schools_sponsor_orgs_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: session_failed_joins session_failed_joins_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_failed_joins
    ADD CONSTRAINT session_failed_joins_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_failed_joins session_failed_joins_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_failed_joins
    ADD CONSTRAINT session_failed_joins_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: session_messages session_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_messages
    ADD CONSTRAINT session_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES upchieve.users(id);


--
-- Name: session_messages session_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_messages
    ADD CONSTRAINT session_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_photos session_photos_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_photos
    ADD CONSTRAINT session_photos_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_reports session_reports_report_reason_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_reports
    ADD CONSTRAINT session_reports_report_reason_id_fkey FOREIGN KEY (report_reason_id) REFERENCES upchieve.report_reasons(id);


--
-- Name: session_reports session_reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_reports
    ADD CONSTRAINT session_reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES upchieve.users(id);


--
-- Name: session_reports session_reports_reporting_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_reports
    ADD CONSTRAINT session_reports_reporting_user_id_fkey FOREIGN KEY (reporting_user_id) REFERENCES upchieve.users(id);


--
-- Name: session_reports session_reports_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_reports
    ADD CONSTRAINT session_reports_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_review_reasons session_review_reasons_session_flag_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_review_reasons
    ADD CONSTRAINT session_review_reasons_session_flag_id_fkey FOREIGN KEY (session_flag_id) REFERENCES upchieve.session_flags(id);


--
-- Name: session_review_reasons session_review_reasons_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_review_reasons
    ADD CONSTRAINT session_review_reasons_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: sessions sessions_ended_by_role_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_ended_by_role_id_fkey FOREIGN KEY (ended_by_role_id) REFERENCES upchieve.user_roles(id);


--
-- Name: sessions_session_flags sessions_session_flags_session_flag_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions_session_flags
    ADD CONSTRAINT sessions_session_flags_session_flag_id_fkey FOREIGN KEY (session_flag_id) REFERENCES upchieve.session_flags(id);


--
-- Name: sessions_session_flags sessions_session_flags_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions_session_flags
    ADD CONSTRAINT sessions_session_flags_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: sessions sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES upchieve.users(id);


--
-- Name: sessions sessions_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: sessions sessions_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES upchieve.users(id);


--
-- Name: sponsor_orgs_upchieve_instances sponsor_orgs_upchieve_instances_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sponsor_orgs_upchieve_instances
    ADD CONSTRAINT sponsor_orgs_upchieve_instances_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: sponsor_orgs_volunteer_partner_orgs_instances sponsor_orgs_volunteer_partner_or_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sponsor_orgs_volunteer_partner_orgs_instances
    ADD CONSTRAINT sponsor_orgs_volunteer_partner_or_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: sponsor_orgs_volunteer_partner_orgs_instances sponsor_orgs_volunteer_partner_orgs_instanc_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sponsor_orgs_volunteer_partner_orgs_instances
    ADD CONSTRAINT sponsor_orgs_volunteer_partner_orgs_instanc_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: student_favorite_volunteers student_favorite_volunteers_student_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_favorite_volunteers
    ADD CONSTRAINT student_favorite_volunteers_student_id_fkey FOREIGN KEY (student_id) REFERENCES upchieve.users(id);


--
-- Name: student_favorite_volunteers student_favorite_volunteers_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_favorite_volunteers
    ADD CONSTRAINT student_favorite_volunteers_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES upchieve.users(id);


--
-- Name: student_partner_org_sites student_partner_org_sites_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_org_sites
    ADD CONSTRAINT student_partner_org_sites_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_partner_orgs_sponsor_orgs_instances student_partner_orgs_sponsor_orgs_i_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_sponsor_orgs_instances
    ADD CONSTRAINT student_partner_orgs_sponsor_orgs_i_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_partner_orgs_sponsor_orgs_instances student_partner_orgs_sponsor_orgs_instances_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_sponsor_orgs_instances
    ADD CONSTRAINT student_partner_orgs_sponsor_orgs_instances_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: student_partner_orgs_sponsor_orgs student_partner_orgs_sponsor_orgs_sponsor_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_sponsor_orgs
    ADD CONSTRAINT student_partner_orgs_sponsor_orgs_sponsor_org_id_fkey FOREIGN KEY (sponsor_org_id) REFERENCES upchieve.sponsor_orgs(id);


--
-- Name: student_partner_orgs_sponsor_orgs student_partner_orgs_sponsor_orgs_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_sponsor_orgs
    ADD CONSTRAINT student_partner_orgs_sponsor_orgs_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_partner_orgs_upchieve_instances student_partner_orgs_upchieve_insta_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_upchieve_instances
    ADD CONSTRAINT student_partner_orgs_upchieve_insta_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_partner_orgs_volunteer_partner_orgs_instances student_partner_orgs_volunteer_pa_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_volunteer_partner_orgs_instances
    ADD CONSTRAINT student_partner_orgs_volunteer_pa_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: student_partner_orgs_volunteer_partner_orgs_instances student_partner_orgs_volunteer_part_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_partner_orgs_volunteer_partner_orgs_instances
    ADD CONSTRAINT student_partner_orgs_volunteer_part_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_profiles student_profiles_grade_level_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_grade_level_id_fkey FOREIGN KEY (grade_level_id) REFERENCES upchieve.grade_levels(id);


--
-- Name: student_profiles student_profiles_postal_code_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_postal_code_fkey FOREIGN KEY (postal_code) REFERENCES upchieve.postal_codes(code);


--
-- Name: student_profiles student_profiles_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: student_profiles student_profiles_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: student_profiles student_profiles_student_partner_org_site_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_student_partner_org_site_id_fkey FOREIGN KEY (student_partner_org_site_id) REFERENCES upchieve.student_partner_org_sites(id);


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: subjects subjects_tool_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.subjects
    ADD CONSTRAINT subjects_tool_type_id_fkey FOREIGN KEY (tool_type_id) REFERENCES upchieve.tool_types(id);


--
-- Name: subjects subjects_topic_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.subjects
    ADD CONSTRAINT subjects_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES upchieve.topics(id);


--
-- Name: survey_questions_question_tags survey_questions_question_tags_question_tag_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions_question_tags
    ADD CONSTRAINT survey_questions_question_tags_question_tag_id_fkey FOREIGN KEY (question_tag_id) REFERENCES upchieve.question_tags(id);


--
-- Name: survey_questions_question_tags survey_questions_question_tags_survey_question_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions_question_tags
    ADD CONSTRAINT survey_questions_question_tags_survey_question_id_fkey FOREIGN KEY (survey_question_id) REFERENCES upchieve.survey_questions(id);


--
-- Name: survey_questions survey_questions_question_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions
    ADD CONSTRAINT survey_questions_question_type_id_fkey FOREIGN KEY (question_type_id) REFERENCES upchieve.question_types(id);


--
-- Name: survey_questions_response_choices survey_questions_response_choic_surveys_survey_question_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choic_surveys_survey_question_id_fkey FOREIGN KEY (surveys_survey_question_id) REFERENCES upchieve.surveys_survey_questions(id) ON DELETE CASCADE;


--
-- Name: survey_questions_response_choices survey_questions_response_choices_response_choice_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choices_response_choice_id_fkey FOREIGN KEY (response_choice_id) REFERENCES upchieve.survey_response_choices(id) ON DELETE CASCADE;


--
-- Name: surveys_context surveys_context_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_context
    ADD CONSTRAINT surveys_context_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id) ON DELETE CASCADE;


--
-- Name: surveys_context surveys_context_survey_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys(id) ON DELETE CASCADE;


--
-- Name: surveys_context surveys_context_survey_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_type_id_fkey FOREIGN KEY (survey_type_id) REFERENCES upchieve.survey_types(id) ON DELETE CASCADE;


--
-- Name: surveys surveys_role_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys
    ADD CONSTRAINT surveys_role_id_fkey FOREIGN KEY (role_id) REFERENCES upchieve.user_roles(id);


--
-- Name: surveys_survey_questions surveys_survey_questions_survey_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys(id) ON DELETE CASCADE;


--
-- Name: surveys_survey_questions surveys_survey_questions_survey_question_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_question_id_fkey FOREIGN KEY (survey_question_id) REFERENCES upchieve.survey_questions(id) ON DELETE CASCADE;


--
-- Name: user_actions user_actions_ip_address_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions
    ADD CONSTRAINT user_actions_ip_address_id_fkey FOREIGN KEY (ip_address_id) REFERENCES upchieve.ip_addresses(id);


--
-- Name: user_actions user_actions_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions
    ADD CONSTRAINT user_actions_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: user_actions user_actions_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_actions
    ADD CONSTRAINT user_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: user_product_flags user_product_flags_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_product_flags
    ADD CONSTRAINT user_product_flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: user_session_metrics user_session_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.user_session_metrics
    ADD CONSTRAINT user_session_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users users_ban_reason_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_ban_reason_id_fkey FOREIGN KEY (ban_reason_id) REFERENCES upchieve.ban_reasons(id);


--
-- Name: users_certifications users_certifications_certification_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_certifications
    ADD CONSTRAINT users_certifications_certification_id_fkey FOREIGN KEY (certification_id) REFERENCES upchieve.certifications(id);


--
-- Name: users_certifications users_certifications_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_certifications
    ADD CONSTRAINT users_certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_ip_addresses users_ip_addresses_ip_address_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_ip_addresses
    ADD CONSTRAINT users_ip_addresses_ip_address_id_fkey FOREIGN KEY (ip_address_id) REFERENCES upchieve.ip_addresses(id);


--
-- Name: users_ip_addresses users_ip_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_ip_addresses
    ADD CONSTRAINT users_ip_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_quizzes users_quizzes_quiz_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_quizzes
    ADD CONSTRAINT users_quizzes_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES upchieve.quizzes(id);


--
-- Name: users_quizzes users_quizzes_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_quizzes
    ADD CONSTRAINT users_quizzes_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_roles users_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_roles
    ADD CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users users_signup_source_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users
    ADD CONSTRAINT users_signup_source_id_fkey FOREIGN KEY (signup_source_id) REFERENCES upchieve.signup_sources(id);


--
-- Name: users_student_partner_orgs_instances users_student_partner_orgs_ins_student_partner_org_site_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_student_partner_orgs_instances
    ADD CONSTRAINT users_student_partner_orgs_ins_student_partner_org_site_id_fkey FOREIGN KEY (student_partner_org_site_id) REFERENCES upchieve.student_partner_org_sites(id);


--
-- Name: users_student_partner_orgs_instances users_student_partner_orgs_instance_student_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_student_partner_orgs_instances
    ADD CONSTRAINT users_student_partner_orgs_instance_student_partner_org_id_fkey FOREIGN KEY (student_partner_org_id) REFERENCES upchieve.student_partner_orgs(id);


--
-- Name: users_student_partner_orgs_instances users_student_partner_orgs_instances_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_student_partner_orgs_instances
    ADD CONSTRAINT users_student_partner_orgs_instances_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_surveys users_surveys_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT users_surveys_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: users_surveys_submissions users_surveys_submissions_survey_question_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys_submissions
    ADD CONSTRAINT users_surveys_submissions_survey_question_id_fkey FOREIGN KEY (survey_question_id) REFERENCES upchieve.survey_questions(id);


--
-- Name: users_surveys_submissions users_surveys_submissions_survey_response_choice_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys_submissions
    ADD CONSTRAINT users_surveys_submissions_survey_response_choice_id_fkey FOREIGN KEY (survey_response_choice_id) REFERENCES upchieve.survey_response_choices(id);


--
-- Name: users_surveys users_surveys_survey_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT users_surveys_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys(id);


--
-- Name: users_surveys users_surveys_survey_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT users_surveys_survey_type_id_fkey FOREIGN KEY (survey_type_id) REFERENCES upchieve.survey_types(id);


--
-- Name: users_surveys users_surveys_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_surveys
    ADD CONSTRAINT users_surveys_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_training_courses users_training_courses_training_course_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_training_courses
    ADD CONSTRAINT users_training_courses_training_course_id_fkey FOREIGN KEY (training_course_id) REFERENCES upchieve.training_courses(id);


--
-- Name: users_training_courses users_training_courses_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_training_courses
    ADD CONSTRAINT users_training_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: users_volunteer_partner_orgs_instances users_volunteer_partner_orgs_inst_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_volunteer_partner_orgs_instances
    ADD CONSTRAINT users_volunteer_partner_orgs_inst_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: users_volunteer_partner_orgs_instances users_volunteer_partner_orgs_instances_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_volunteer_partner_orgs_instances
    ADD CONSTRAINT users_volunteer_partner_orgs_instances_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: volunteer_occupations volunteer_occupations_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_occupations
    ADD CONSTRAINT volunteer_occupations_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: volunteer_partner_orgs_upchieve_instances volunteer_partner_orgs_upchieve_i_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_partner_orgs_upchieve_instances
    ADD CONSTRAINT volunteer_partner_orgs_upchieve_i_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: volunteer_profiles volunteer_profiles_photo_id_status_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_photo_id_status_fkey FOREIGN KEY (photo_id_status) REFERENCES upchieve.photo_id_statuses(id);


--
-- Name: volunteer_profiles volunteer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: volunteer_profiles volunteer_profiles_volunteer_partner_org_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_volunteer_partner_org_id_fkey FOREIGN KEY (volunteer_partner_org_id) REFERENCES upchieve.volunteer_partner_orgs(id);


--
-- Name: volunteer_references volunteer_references_status_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_references
    ADD CONSTRAINT volunteer_references_status_id_fkey FOREIGN KEY (status_id) REFERENCES upchieve.volunteer_reference_statuses(id);


--
-- Name: volunteer_references volunteer_references_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.volunteer_references
    ADD CONSTRAINT volunteer_references_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20211026204222'),
    ('20211026204728'),
    ('20211026205335'),
    ('20211026205336'),
    ('20211026205851'),
    ('20211026210226'),
    ('20211026212926'),
    ('20211026213627'),
    ('20211026215046'),
    ('20211026215053'),
    ('20211026215100'),
    ('20211026215527'),
    ('20211026215528'),
    ('20211026220716'),
    ('20211026220742'),
    ('20211026220747'),
    ('20211026220750'),
    ('20211026221439'),
    ('20211109204227'),
    ('20211109204327'),
    ('20211109204504'),
    ('20211109204648'),
    ('20211109205544'),
    ('20211109205821'),
    ('20211109210727'),
    ('20211109210828'),
    ('20211109210830'),
    ('20211109210832'),
    ('20211109210900'),
    ('20211109210901'),
    ('20211109210902'),
    ('20211109210905'),
    ('20211109210906'),
    ('20211109210907'),
    ('20211109210908'),
    ('20211109210909'),
    ('20211109210916'),
    ('20211109210917'),
    ('20211109210918'),
    ('20211109211000'),
    ('20211109211001'),
    ('20211109211002'),
    ('20211109211003'),
    ('20211109211004'),
    ('20211109211005'),
    ('20211109211006'),
    ('20211109212726'),
    ('20211109212823'),
    ('20211109212913'),
    ('20211109212949'),
    ('20211109225500'),
    ('20211109225501'),
    ('20211109225604'),
    ('20211109230454'),
    ('20211109230752'),
    ('20211109230801'),
    ('20211109230807'),
    ('20211109231334'),
    ('20211109231346'),
    ('20211109231356'),
    ('20220120223933'),
    ('20220120224349'),
    ('20220120224635'),
    ('20220124171208'),
    ('20220124172750'),
    ('20220217153639'),
    ('20220217154443'),
    ('20220217155144'),
    ('20220217160257'),
    ('20220223184006'),
    ('20220310003451'),
    ('20220310005137'),
    ('20220311204741'),
    ('20220314150152'),
    ('20220314195714'),
    ('20220316180429'),
    ('20220321125820'),
    ('20220321152006'),
    ('20220321174656'),
    ('20220324190648'),
    ('20220324220941'),
    ('20220325223612'),
    ('20220326034520'),
    ('20220326215210'),
    ('20220327162839'),
    ('20220327162854'),
    ('20220327165314'),
    ('20220327170322'),
    ('20220327183934'),
    ('20220327183940'),
    ('20220327183950'),
    ('20220327211734'),
    ('20220328213107'),
    ('20220328213115'),
    ('20220330203235'),
    ('20220330203351'),
    ('20220401143643'),
    ('20220401143650'),
    ('20220401143754'),
    ('20220401143804'),
    ('20220401143810'),
    ('20220405152437'),
    ('20220405222055'),
    ('20220405223056'),
    ('20220405223145'),
    ('20220405224635'),
    ('20220405232100'),
    ('20220504152804'),
    ('20220517154624'),
    ('20220517213052'),
    ('20220520164318'),
    ('20220520164419'),
    ('20220520214438'),
    ('20220520214552'),
    ('20220520214733'),
    ('20220520214846'),
    ('20220522224209'),
    ('20220522224430'),
    ('20220601154505'),
    ('20220602170321'),
    ('20220602170346'),
    ('20220609150924'),
    ('20220614163056'),
    ('20220614202247'),
    ('20220615162628'),
    ('20220630141321'),
    ('20220630192340'),
    ('20220701142259'),
    ('20220710195206'),
    ('20220711163000'),
    ('20220713170236'),
    ('20220727162548'),
    ('20220815150518'),
    ('20220830164711'),
    ('20220830180659'),
    ('20220901190221'),
    ('20220916002003'),
    ('20221026004526'),
    ('20221027064644'),
    ('20221109203803'),
    ('20221114200757'),
    ('20221129175954'),
    ('20221130231208'),
    ('20221201000842'),
    ('20221201064546'),
    ('20221206021238'),
    ('20230104192756'),
    ('20230524032337'),
    ('20230601213111'),
    ('20230621173400'),
    ('20230626161133'),
    ('20230706181722'),
    ('20230719205740'),
    ('20230914134853'),
    ('20230918173353'),
    ('20231002232836'),
    ('20231011185712'),
    ('20231101180420'),
    ('20231109144205'),
    ('20231109145812'),
    ('20231211220614'),
    ('20231221230720');
