\restrict p3vmCkj9q8IbJPH7z1mjZ4BnxYnLKwZNf9twJXL6eKfOg5776bVC2yRjC6fsZ7u

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Ubuntu 15.17-1.pgdg22.04+1)

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
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


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
-- Name: ban_types; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.ban_types AS ENUM (
    'shadow',
    'complete',
    'live_media'
);


--
-- Name: moderation_system; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.moderation_system AS ENUM (
    'regex'
);


--
-- Name: moderation_types; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.moderation_types AS ENUM (
    'contextual',
    'realtime_image'
);


--
-- Name: nths_candidate_application_status; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.nths_candidate_application_status AS ENUM (
    'applied',
    'approved',
    'denied'
);


--
-- Name: paid_tutors_pilot_groups; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.paid_tutors_pilot_groups AS ENUM (
    'control',
    'test'
);


--
-- Name: tutor_bot_conversation_user_type; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.tutor_bot_conversation_user_type AS ENUM (
    'student',
    'bot',
    'volunteer'
);


--
-- Name: tutor_bot_session_user_type; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.tutor_bot_session_user_type AS ENUM (
    'student',
    'bot'
);


--
-- Name: user_school_association_type; Type: TYPE; Schema: upchieve; Owner: -
--

CREATE TYPE upchieve.user_school_association_type AS ENUM (
    'student_at_school',
    'teacher_at_school'
);


--
-- Name: freeze_signup_grade_level_id(); Type: FUNCTION; Schema: upchieve; Owner: -
--

CREATE FUNCTION upchieve.freeze_signup_grade_level_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.signup_grade_level_id IS DISTINCT FROM OLD.signup_grade_level_id THEN
        RAISE EXCEPTION 'signup_grade_level_id cannot be changed after it is set';
    END IF;
    RETURN NEW;
END;
$$;


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
-- Name: TABLE admin_profiles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.admin_profiles IS '@deprecated - use upchieve.users_roles to determine whether a user is admin';


--
-- Name: COLUMN admin_profiles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.admin_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN admin_profiles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.admin_profiles.created_at IS 'not_pii';


--
-- Name: COLUMN admin_profiles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.admin_profiles.updated_at IS 'not_pii';


--
-- Name: assignments; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.assignments (
    id uuid NOT NULL,
    class_id uuid NOT NULL,
    description text,
    title text,
    number_of_sessions integer,
    min_duration_in_minutes integer,
    due_date timestamp with time zone,
    start_date timestamp with time zone,
    is_required boolean DEFAULT false NOT NULL,
    subject_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE assignments; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.assignments IS 'Assignments created by teachers for the students in their class';


--
-- Name: COLUMN assignments.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.id IS 'not_pii: Primary key';


--
-- Name: COLUMN assignments.class_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.class_id IS 'not_pii: Foreign key to upchieve.teacher_classes';


--
-- Name: COLUMN assignments.description; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.description IS 'not_pii: Free-text description of the assignment';


--
-- Name: COLUMN assignments.title; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.title IS 'not_pii: Title of the assignment';


--
-- Name: COLUMN assignments.number_of_sessions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.number_of_sessions IS 'not_pii: Required number of tutoring sessions for the assignment';


--
-- Name: COLUMN assignments.min_duration_in_minutes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.min_duration_in_minutes IS 'not_pii: Minimum session duration in minutes required by the assignment';


--
-- Name: COLUMN assignments.due_date; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.due_date IS 'not_pii: Assignment due date';


--
-- Name: COLUMN assignments.start_date; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.start_date IS 'not_pii: Assignment start date';


--
-- Name: COLUMN assignments.is_required; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.is_required IS 'not_pii: Whether the assignment is required for the class';


--
-- Name: COLUMN assignments.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN assignments.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.created_at IS 'not_pii';


--
-- Name: COLUMN assignments.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assignments.updated_at IS 'not_pii';


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
-- Name: TABLE assistments_data; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.assistments_data IS '@deprecated - we no longer send data to ASSISTments';


--
-- Name: COLUMN assistments_data.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.id IS 'not_pii: Primary key';


--
-- Name: COLUMN assistments_data.problem_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.problem_id IS 'not_pii: ASSISTments problem identifier';


--
-- Name: COLUMN assistments_data.assignment_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.assignment_id IS 'not_pii: Assignment id in the external system';


--
-- Name: COLUMN assistments_data.student_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.student_id IS 'not_pii: Student id in the external system';


--
-- Name: COLUMN assistments_data.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN assistments_data.sent; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.sent IS 'not_pii: Whether the record has been sent to the external system';


--
-- Name: COLUMN assistments_data.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.created_at IS 'not_pii';


--
-- Name: COLUMN assistments_data.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.updated_at IS 'not_pii';


--
-- Name: COLUMN assistments_data.sent_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.sent_at IS 'not_pii: Timestamp when the record was sent to the external system';


--
-- Name: COLUMN assistments_data.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.assistments_data.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE associated_partners; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.associated_partners IS 'Join table for which student/volunteer partner organizations are associated with each other';


--
-- Name: COLUMN associated_partners.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.id IS 'not_pii: Primary key';


--
-- Name: COLUMN associated_partners.key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.key IS 'not_pii: Unique URL-safe slug';


--
-- Name: COLUMN associated_partners.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN associated_partners.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN associated_partners.student_sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.student_sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN associated_partners.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.created_at IS 'not_pii';


--
-- Name: COLUMN associated_partners.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.associated_partners.updated_at IS 'not_pii';


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
-- Name: TABLE availabilities; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.availabilities IS 'The days/hours that volunteers have selected for receiving push notifications when a student needs help on the platform';


--
-- Name: COLUMN availabilities.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.id IS 'not_pii: Primary key';


--
-- Name: COLUMN availabilities.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN availabilities.weekday_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.weekday_id IS 'not_pii: Foreign key to upchieve.weekdays';


--
-- Name: COLUMN availabilities.available_start; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.available_start IS 'not_pii: Start hour of the availability window (0-23)';


--
-- Name: COLUMN availabilities.available_end; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.available_end IS 'not_pii: End hour of the availability window (0-23)';


--
-- Name: COLUMN availabilities.timezone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.timezone IS 'not_pii: IANA timezone identifier';


--
-- Name: COLUMN availabilities.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.created_at IS 'not_pii';


--
-- Name: COLUMN availabilities.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availabilities.updated_at IS 'not_pii';


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
-- Name: TABLE availability_histories; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.availability_histories IS 'All historical days/hours that volunteers had selected for availaibility on the platform';


--
-- Name: COLUMN availability_histories.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.id IS 'not_pii: Primary key';


--
-- Name: COLUMN availability_histories.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN availability_histories.weekday_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.weekday_id IS 'not_pii: Foreign key to upchieve.weekdays';


--
-- Name: COLUMN availability_histories.available_start; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.available_start IS 'not_pii: Start hour of the availability window (0-23)';


--
-- Name: COLUMN availability_histories.available_end; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.available_end IS 'not_pii: End hour of the availability window (0-23)';


--
-- Name: COLUMN availability_histories.timezone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.timezone IS 'not_pii: IANA timezone identifier';


--
-- Name: COLUMN availability_histories.recorded_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.recorded_at IS 'not_pii: Timestamp when the availability snapshot was taken';


--
-- Name: COLUMN availability_histories.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.created_at IS 'not_pii';


--
-- Name: COLUMN availability_histories.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.availability_histories.updated_at IS 'not_pii';


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
-- Name: TABLE ban_reasons; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.ban_reasons IS 'Reference table for reasons a user might be banned';


--
-- Name: COLUMN ban_reasons.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ban_reasons.id IS 'not_pii: Primary key';


--
-- Name: COLUMN ban_reasons.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ban_reasons.name IS 'not_pii: Human-readable name of the ban reason';


--
-- Name: COLUMN ban_reasons.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ban_reasons.created_at IS 'not_pii';


--
-- Name: COLUMN ban_reasons.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ban_reasons.updated_at IS 'not_pii';


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
-- Name: censored_session_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.censored_session_messages (
    id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message text,
    session_id uuid NOT NULL,
    censored_by upchieve.moderation_system NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    shown boolean NOT NULL
);


--
-- Name: TABLE censored_session_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.censored_session_messages IS 'Session messages that have been flagged by moderation';


--
-- Name: COLUMN censored_session_messages.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.id IS 'not_pii: Primary key';


--
-- Name: COLUMN censored_session_messages.sender_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';


--
-- Name: COLUMN censored_session_messages.message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.message IS 'not_pii: Message text content';


--
-- Name: COLUMN censored_session_messages.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN censored_session_messages.censored_by; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.censored_by IS 'not_pii: Moderation system that flagged the message';


--
-- Name: COLUMN censored_session_messages.sent_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.sent_at IS 'not_pii: Timestamp when the message was sent';


--
-- Name: COLUMN censored_session_messages.shown; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.censored_session_messages.shown IS 'not_pii: Whether the non-censored message was shown to the recipient';


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
-- Name: TABLE certification_subject_unlocks; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.certification_subject_unlocks IS 'Indicates which certifications unlock which subjects a volunteer can tutor in';


--
-- Name: COLUMN certification_subject_unlocks.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certification_subject_unlocks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN certification_subject_unlocks.certification_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certification_subject_unlocks.certification_id IS 'not_pii: Foreign key to upchieve.certifications';


--
-- Name: COLUMN certification_subject_unlocks.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certification_subject_unlocks.created_at IS 'not_pii';


--
-- Name: COLUMN certification_subject_unlocks.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certification_subject_unlocks.updated_at IS 'not_pii';


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
-- Name: TABLE certifications; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.certifications IS 'Lookup table of volunteer certifications that unlock tutoring subjects upon passing the associated quiz';


--
-- Name: COLUMN certifications.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certifications.id IS 'not_pii: Primary key';


--
-- Name: COLUMN certifications.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certifications.name IS 'not_pii: Human-readable name of the certification';


--
-- Name: COLUMN certifications.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certifications.created_at IS 'not_pii';


--
-- Name: COLUMN certifications.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certifications.updated_at IS 'not_pii';


--
-- Name: COLUMN certifications.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.certifications.active IS 'not_pii: Whether this certification is currently offered';


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
-- Name: TABLE cities; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.cities IS 'Reference table of US cities';


--
-- Name: COLUMN cities.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.cities.id IS 'not_pii: Primary key';


--
-- Name: COLUMN cities.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.cities.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN cities.us_state_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.cities.us_state_code IS 'not_pii: Two-letter US state code';


--
-- Name: COLUMN cities.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.cities.created_at IS 'not_pii';


--
-- Name: COLUMN cities.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.cities.updated_at IS 'not_pii';


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
-- Name: clever_school_mapping; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.clever_school_mapping (
    clever_school_id text NOT NULL,
    upchieve_school_id uuid NOT NULL
);


--
-- Name: TABLE clever_school_mapping; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.clever_school_mapping IS 'Mapping of Clever school ids to the school in upchieve.schools';


--
-- Name: COLUMN clever_school_mapping.clever_school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.clever_school_mapping.clever_school_id IS 'not_pii: Clever LMS school identifier';


--
-- Name: COLUMN clever_school_mapping.upchieve_school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.clever_school_mapping.upchieve_school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: column_descriptions; Type: VIEW; Schema: upchieve; Owner: -
--

CREATE VIEW upchieve.column_descriptions AS
 SELECT c.table_name,
    c.column_name,
    (pg_description.description ~~ 'pii%'::text) AS is_pii,
        CASE
            WHEN (pg_description.description ~~ '%: %'::text) THEN SUBSTRING(pg_description.description FROM (POSITION((': '::text) IN (pg_description.description)) + 2))
            ELSE ''::text
        END AS description
   FROM ((((information_schema.columns c
     JOIN pg_class ON ((pg_class.relname = (c.table_name)::name)))
     JOIN pg_namespace ON (((pg_namespace.nspname = (c.table_schema)::name) AND (pg_namespace.oid = pg_class.relnamespace))))
     JOIN pg_attribute ON (((pg_attribute.attrelid = pg_class.oid) AND (pg_attribute.attname = (c.column_name)::name))))
     LEFT JOIN pg_description ON (((pg_description.objoid = pg_class.oid) AND (pg_description.objsubid = pg_attribute.attnum))))
  WHERE (((c.table_schema)::name = 'upchieve'::name) AND (pg_description.description IS NOT NULL) AND ((pg_description.description ~~ 'pii%'::text) OR (pg_description.description ~~ 'not_pii%'::text)));


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
-- Name: TABLE computed_subject_unlocks; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.computed_subject_unlocks IS 'Indicates which certifications unlock which subjects a volunteer can tutor in, when the subject requires multiple certifications';


--
-- Name: COLUMN computed_subject_unlocks.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.computed_subject_unlocks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN computed_subject_unlocks.certification_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.computed_subject_unlocks.certification_id IS 'not_pii: Foreign key to upchieve.certifications';


--
-- Name: COLUMN computed_subject_unlocks.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.computed_subject_unlocks.created_at IS 'not_pii';


--
-- Name: COLUMN computed_subject_unlocks.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.computed_subject_unlocks.updated_at IS 'not_pii';


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
-- Name: TABLE contact_form_submissions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.contact_form_submissions IS 'Contact form submissions from the website, either before Gleap was implemented or if Gleap is not working';


--
-- Name: COLUMN contact_form_submissions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN contact_form_submissions.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN contact_form_submissions.user_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.user_email IS 'pii: Email address of the submitting user (may be unauthenticated)';


--
-- Name: COLUMN contact_form_submissions.message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.message IS 'not_pii: Message text content';


--
-- Name: COLUMN contact_form_submissions.topic; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.topic IS 'not_pii: Contact form topic category';


--
-- Name: COLUMN contact_form_submissions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.created_at IS 'not_pii';


--
-- Name: COLUMN contact_form_submissions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.contact_form_submissions.updated_at IS 'not_pii';


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
-- Name: TABLE grade_levels; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.grade_levels IS 'Reference table for grade levels of users';


--
-- Name: COLUMN grade_levels.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.grade_levels.id IS 'not_pii: Primary key';


--
-- Name: COLUMN grade_levels.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.grade_levels.name IS 'not_pii: Human-readable name of the grade level';


--
-- Name: COLUMN grade_levels.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.grade_levels.created_at IS 'not_pii';


--
-- Name: COLUMN grade_levels.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.grade_levels.updated_at IS 'not_pii';


--
-- Name: users_grade_levels; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_grade_levels (
    user_id uuid NOT NULL,
    signup_grade_level_id integer,
    grade_level_id integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE users_grade_levels; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_grade_levels IS 'Join table recording the grade level associated with a user';


--
-- Name: COLUMN users_grade_levels.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_grade_levels.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_grade_levels.signup_grade_level_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_grade_levels.signup_grade_level_id IS 'not_pii: Grade level reported at signup; immutable after first set';


--
-- Name: COLUMN users_grade_levels.grade_level_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_grade_levels.grade_level_id IS 'not_pii: Foreign key to upchieve.grade_levels; represents the last updated student grade level';


--
-- Name: COLUMN users_grade_levels.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_grade_levels.updated_at IS 'not_pii: Timestamp when the record was last updated';


--
-- Name: current_grade_levels; Type: VIEW; Schema: upchieve; Owner: -
--

CREATE VIEW upchieve.current_grade_levels AS
 WITH grade_progression AS (
         SELECT ugl.user_id,
            ugl.grade_level_id,
            GREATEST(0, ((EXTRACT(year FROM (CURRENT_DATE - '6 mons'::interval)))::integer - (EXTRACT(year FROM ((ugl.updated_at)::date - '6 mons'::interval)))::integer)) AS school_years_passed
           FROM upchieve.users_grade_levels ugl
        )
 SELECT grade_progression.user_id,
        CASE grade_levels.name
            WHEN 'Other'::text THEN 'Other'::text
            ELSE (ARRAY['6th'::text, '7th'::text, '8th'::text, '9th'::text, '10th'::text, '11th'::text, '12th'::text, 'College'::text])[LEAST((array_position(ARRAY['6th'::text, '7th'::text, '8th'::text, '9th'::text, '10th'::text, '11th'::text, '12th'::text, 'College'::text], grade_levels.name) + grade_progression.school_years_passed), 8)]
        END AS current_grade_name
   FROM (grade_progression
     JOIN upchieve.grade_levels ON ((grade_progression.grade_level_id = grade_levels.id)));


--
-- Name: email_domain_blocklist; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.email_domain_blocklist (
    id integer NOT NULL,
    domain character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE email_domain_blocklist; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.email_domain_blocklist IS 'Email domains blocked from registering on the platform';


--
-- Name: COLUMN email_domain_blocklist.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.email_domain_blocklist.id IS 'not_pii: Primary key';


--
-- Name: COLUMN email_domain_blocklist.domain; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.email_domain_blocklist.domain IS 'not_pii: Email domain blocked from registration';


--
-- Name: COLUMN email_domain_blocklist.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.email_domain_blocklist.created_at IS 'not_pii';


--
-- Name: COLUMN email_domain_blocklist.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.email_domain_blocklist.updated_at IS 'not_pii';


--
-- Name: email_domain_blocklist_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.email_domain_blocklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_domain_blocklist_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.email_domain_blocklist_id_seq OWNED BY upchieve.email_domain_blocklist.id;


--
-- Name: federated_credentials; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.federated_credentials (
    id text NOT NULL,
    issuer text NOT NULL,
    user_id uuid
);


--
-- Name: TABLE federated_credentials; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.federated_credentials IS 'OAuth federated identity credentials linking external providers to user accounts';


--
-- Name: COLUMN federated_credentials.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.federated_credentials.id IS 'pii: External provider subject identifier (sub claim)';


--
-- Name: COLUMN federated_credentials.issuer; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.federated_credentials.issuer IS 'not_pii: OAuth 2.0 issuer URL for the federated credential';


--
-- Name: COLUMN federated_credentials.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.federated_credentials.user_id IS 'not_pii: Foreign key to upchieve.users';


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
-- Name: TABLE feedbacks; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.feedbacks IS '@deprecated - use upchieve.users_surveys; post-session feedback submitted by students and volunteers';


--
-- Name: COLUMN feedbacks.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.id IS 'not_pii: Primary key';


--
-- Name: COLUMN feedbacks.topic_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.topic_id IS 'not_pii: Foreign key to upchieve.topics';


--
-- Name: COLUMN feedbacks.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN feedbacks.user_role_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.user_role_id IS 'not_pii: Foreign key to upchieve.user_roles';


--
-- Name: COLUMN feedbacks.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN feedbacks.student_tutoring_feedback; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.student_tutoring_feedback IS 'not_pii: JSON feedback from the student about the tutoring session';


--
-- Name: COLUMN feedbacks.student_counseling_feedback; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.student_counseling_feedback IS 'not_pii: JSON feedback from the student about counseling';


--
-- Name: COLUMN feedbacks.volunteer_feedback; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.volunteer_feedback IS 'not_pii: JSON feedback from the volunteer about the session';


--
-- Name: COLUMN feedbacks.comment; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.comment IS 'not_pii: Free-text comment provided during feedback';


--
-- Name: COLUMN feedbacks.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN feedbacks.legacy_feedbacks; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.legacy_feedbacks IS 'not_pii: Raw feedback data imported from MongoDB';


--
-- Name: COLUMN feedbacks.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.created_at IS 'not_pii';


--
-- Name: COLUMN feedbacks.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.updated_at IS 'not_pii';


--
-- Name: COLUMN feedbacks.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.feedbacks.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE ineligible_students; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.ineligible_students IS 'Records of users who attempted to register but did not meet student eligibility criteria';


--
-- Name: COLUMN ineligible_students.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.id IS 'not_pii: Primary key';


--
-- Name: COLUMN ineligible_students.email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.email IS 'pii: User email address';


--
-- Name: COLUMN ineligible_students.postal_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.postal_code IS 'pii: US postal/ZIP code';


--
-- Name: COLUMN ineligible_students.ip_address_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';


--
-- Name: COLUMN ineligible_students.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.school_id IS 'pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN ineligible_students.grade_level_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.grade_level_id IS 'pii: Foreign key to upchieve.grade_levels';


--
-- Name: COLUMN ineligible_students.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.created_at IS 'not_pii';


--
-- Name: COLUMN ineligible_students.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.updated_at IS 'not_pii';


--
-- Name: COLUMN ineligible_students.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN ineligible_students.referred_by; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ineligible_students.referred_by IS 'pii: Foreign key to upchieve.users who made the referral';


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
-- Name: TABLE ip_addresses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.ip_addresses IS 'IP addresses observed on the platform, with allow/block status';


--
-- Name: COLUMN ip_addresses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN ip_addresses.ip; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.ip IS 'pii: IPv4 or IPv6 address';


--
-- Name: COLUMN ip_addresses.status; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.status IS 'not_pii: Status label for the IP address (e.g. allowed, blocked)';


--
-- Name: COLUMN ip_addresses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.created_at IS 'not_pii';


--
-- Name: COLUMN ip_addresses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.updated_at IS 'not_pii';


--
-- Name: COLUMN ip_addresses.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.ip_addresses.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE legacy_availability_histories; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.legacy_availability_histories IS '@deprecated - historical volunteer availability snapshots imported from MongoDB';


--
-- Name: COLUMN legacy_availability_histories.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.id IS 'not_pii: Primary key';


--
-- Name: COLUMN legacy_availability_histories.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN legacy_availability_histories.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN legacy_availability_histories.timezone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.timezone IS 'pii: IANA timezone identifier';


--
-- Name: COLUMN legacy_availability_histories.recorded_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.recorded_at IS 'not_pii: Timestamp when the availability snapshot was taken';


--
-- Name: COLUMN legacy_availability_histories.legacy_availability; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.legacy_availability IS 'not_pii: JSON availability map imported from MongoDB';


--
-- Name: COLUMN legacy_availability_histories.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.created_at IS 'not_pii';


--
-- Name: COLUMN legacy_availability_histories.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.legacy_availability_histories.updated_at IS 'not_pii';


--
-- Name: moderation_actions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_actions (
    id integer NOT NULL,
    action_name text,
    description text
);


--
-- Name: TABLE moderation_actions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_actions IS 'Reference table of actions that can be triggered by a moderation rule';


--
-- Name: COLUMN moderation_actions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_actions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN moderation_actions.action_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_actions.action_name IS 'not_pii: Name of the moderation action';


--
-- Name: COLUMN moderation_actions.description; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_actions.description IS 'not_pii: Free-text description';


--
-- Name: moderation_actions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.moderation_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: moderation_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.moderation_actions_id_seq OWNED BY upchieve.moderation_actions.id;


--
-- Name: moderation_categories; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE moderation_categories; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_categories IS 'Reference table of content categories used in the moderation system';


--
-- Name: COLUMN moderation_categories.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_categories.id IS 'not_pii: Primary key';


--
-- Name: COLUMN moderation_categories.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_categories.name IS 'not_pii: Human-readable name';


--
-- Name: moderation_categories_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.moderation_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: moderation_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.moderation_categories_id_seq OWNED BY upchieve.moderation_categories.id;


--
-- Name: moderation_infractions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_infractions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    reason json NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE moderation_infractions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_infractions IS 'Records of moderation rule violations committed by a user in a session';


--
-- Name: COLUMN moderation_infractions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN moderation_infractions.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN moderation_infractions.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN moderation_infractions.reason; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.reason IS 'not_pii: JSON describing the moderation infraction details';


--
-- Name: COLUMN moderation_infractions.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.active IS 'not_pii: ??';


--
-- Name: COLUMN moderation_infractions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.created_at IS 'not_pii';


--
-- Name: COLUMN moderation_infractions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_infractions.updated_at IS 'not_pii';


--
-- Name: moderation_penalty_config; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_penalty_config (
    id integer NOT NULL,
    min_weight integer NOT NULL,
    max_weight integer NOT NULL,
    moderation_type upchieve.moderation_types,
    CONSTRAINT moderation_penalty_min_le_max CHECK ((min_weight <= max_weight))
);


--
-- Name: TABLE moderation_penalty_config; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_penalty_config IS 'Configuration mapping penalty weight ranges to moderation types';


--
-- Name: COLUMN moderation_penalty_config.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_penalty_config.id IS 'not_pii: Primary key';


--
-- Name: COLUMN moderation_penalty_config.min_weight; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_penalty_config.min_weight IS 'not_pii: Minimum penalty weight threshold for this config';


--
-- Name: COLUMN moderation_penalty_config.max_weight; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_penalty_config.max_weight IS 'not_pii: Maximum penalty weight for this config';


--
-- Name: COLUMN moderation_penalty_config.moderation_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_penalty_config.moderation_type IS 'not_pii: Moderation system type (contextual or realtime_image)';


--
-- Name: moderation_penalty_config_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.moderation_penalty_config ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.moderation_penalty_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: moderation_rule_actions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_rule_actions (
    rule_id integer NOT NULL,
    action_id integer NOT NULL
);


--
-- Name: TABLE moderation_rule_actions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_rule_actions IS 'Join table linking moderation rules to the actions they trigger';


--
-- Name: COLUMN moderation_rule_actions.rule_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rule_actions.rule_id IS 'not_pii: Foreign key to upchieve.moderation_rules';


--
-- Name: COLUMN moderation_rule_actions.action_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rule_actions.action_id IS 'not_pii: Foreign key to upchieve.moderation_actions';


--
-- Name: moderation_rules; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_rules (
    id integer NOT NULL,
    name text,
    description text
);


--
-- Name: TABLE moderation_rules; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_rules IS 'Rules that govern automated content moderation on the platform';


--
-- Name: COLUMN moderation_rules.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rules.id IS 'not_pii: Primary key';


--
-- Name: COLUMN moderation_rules.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rules.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN moderation_rules.description; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rules.description IS 'not_pii: Free-text description';


--
-- Name: moderation_rules_flags; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_rules_flags (
    flag_id integer NOT NULL,
    rule_id integer NOT NULL
);


--
-- Name: TABLE moderation_rules_flags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_rules_flags IS 'Join table linking moderation rules to the session flags they raise';


--
-- Name: COLUMN moderation_rules_flags.flag_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rules_flags.flag_id IS 'not_pii: Foreign key to upchieve.session_flags';


--
-- Name: COLUMN moderation_rules_flags.rule_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_rules_flags.rule_id IS 'not_pii: Foreign key to upchieve.moderation_rules';


--
-- Name: moderation_rules_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.moderation_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: moderation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.moderation_rules_id_seq OWNED BY upchieve.moderation_rules.id;


--
-- Name: moderation_settings; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.moderation_settings (
    moderation_type upchieve.moderation_types,
    moderation_category_id integer,
    threshold numeric(3,2),
    penalty_weight integer DEFAULT 0 NOT NULL
);


--
-- Name: TABLE moderation_settings; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.moderation_settings IS 'Thresholds and penalty weights for the automated content moderation system';


--
-- Name: COLUMN moderation_settings.moderation_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_settings.moderation_type IS 'not_pii: Moderation system type (contextual or realtime_image)';


--
-- Name: COLUMN moderation_settings.moderation_category_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_settings.moderation_category_id IS 'not_pii: Foreign key to upchieve.moderation_categories';


--
-- Name: COLUMN moderation_settings.threshold; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_settings.threshold IS 'not_pii: Confidence score threshold for triggering moderation';


--
-- Name: COLUMN moderation_settings.penalty_weight; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.moderation_settings.penalty_weight IS 'not_pii: Penalty weight assigned to this moderation rule';


--
-- Name: muted_users_subject_alerts; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.muted_users_subject_alerts (
    user_id uuid NOT NULL,
    subject_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE muted_users_subject_alerts; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.muted_users_subject_alerts IS 'Subjects for which a volunteer has muted incoming session request notifications';


--
-- Name: COLUMN muted_users_subject_alerts.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN muted_users_subject_alerts.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN muted_users_subject_alerts.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.muted_users_subject_alerts.created_at IS 'not_pii';


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
-- Name: TABLE notification_methods; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.notification_methods IS 'Reference table of notification delivery methods';


--
-- Name: COLUMN notification_methods.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_methods.id IS 'not_pii: Primary key';


--
-- Name: COLUMN notification_methods.method; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_methods.method IS 'not_pii: Delivery method for the notification (e.g. email, sms, push)';


--
-- Name: COLUMN notification_methods.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_methods.created_at IS 'not_pii';


--
-- Name: COLUMN notification_methods.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_methods.updated_at IS 'not_pii';


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
-- Name: TABLE notification_priority_groups; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.notification_priority_groups IS 'Reference table of priority tiers for targeting volunteers with session request notifications';


--
-- Name: COLUMN notification_priority_groups.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_priority_groups.id IS 'not_pii: Primary key';


--
-- Name: COLUMN notification_priority_groups.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_priority_groups.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN notification_priority_groups.priority; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_priority_groups.priority IS 'not_pii: Priority level for the notification group';


--
-- Name: COLUMN notification_priority_groups.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_priority_groups.created_at IS 'not_pii';


--
-- Name: COLUMN notification_priority_groups.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_priority_groups.updated_at IS 'not_pii';


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
-- Name: TABLE notification_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.notification_types IS 'Reference table of notification type for session requests (i.e. initial or followup)';


--
-- Name: COLUMN notification_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN notification_types.type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_types.type IS 'not_pii: Notification type label';


--
-- Name: COLUMN notification_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_types.created_at IS 'not_pii';


--
-- Name: COLUMN notification_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notification_types.updated_at IS 'not_pii';


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
    type_id integer,
    method_id integer NOT NULL,
    priority_group_id integer,
    successful boolean,
    session_id uuid,
    message_carrier_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    email_template_id text
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.notifications IS 'Log of notifications sent to users';


--
-- Name: COLUMN notifications.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.id IS 'not_pii: Primary key';


--
-- Name: COLUMN notifications.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.user_id IS 'not_pii: Foreign key to upchieve.users; who the notification was sent to';


--
-- Name: COLUMN notifications.sent_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.sent_at IS 'not_pii: Timestamp when the notification was sent';


--
-- Name: COLUMN notifications.type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.type_id IS 'not_pii: Foreign key to upchieve.notification_types';


--
-- Name: COLUMN notifications.method_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.method_id IS 'not_pii: Foreign key to upchieve.notification_methods';


--
-- Name: COLUMN notifications.priority_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.priority_group_id IS 'not_pii: Foreign key to upchieve.notification_priority_groups';


--
-- Name: COLUMN notifications.successful; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.successful IS 'not_pii: Whether the notification was successfully delivered';


--
-- Name: COLUMN notifications.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN notifications.message_carrier_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.message_carrier_id IS 'pii: External carrier identifier (e.g. Twilio message SID)';


--
-- Name: COLUMN notifications.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.created_at IS 'not_pii';


--
-- Name: COLUMN notifications.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.updated_at IS 'not_pii';


--
-- Name: COLUMN notifications.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN notifications.email_template_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.notifications.email_template_id IS 'not_pii: Identifier of the email template used for the notification';


--
-- Name: nths_actions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_actions (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_actions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_actions IS 'Reference table of actions that can be recorded for an NTHS group';


--
-- Name: COLUMN nths_actions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_actions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_actions.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_actions.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN nths_actions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_actions.created_at IS 'not_pii';


--
-- Name: nths_actions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_actions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nths_advisors; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_advisors (
    id uuid NOT NULL,
    nths_group_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    phone_extension text,
    title text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    school_id uuid
);


--
-- Name: TABLE nths_advisors; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_advisors IS 'School advisors who oversee NTHS chapters';


--
-- Name: COLUMN nths_advisors.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_advisors.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_advisors.first_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.first_name IS 'pii: First name';


--
-- Name: COLUMN nths_advisors.last_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.last_name IS 'pii: Last name';


--
-- Name: COLUMN nths_advisors.email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.email IS 'pii: User email address';


--
-- Name: COLUMN nths_advisors.phone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.phone IS 'pii: Phone number';


--
-- Name: COLUMN nths_advisors.phone_extension; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.phone_extension IS 'pii: Phone extension for the contact';


--
-- Name: COLUMN nths_advisors.title; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.title IS 'pii: Professional title of the NTHS advisor';


--
-- Name: COLUMN nths_advisors.verified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.verified IS 'not_pii: Whether the advisor has been verified';


--
-- Name: COLUMN nths_advisors.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.created_at IS 'not_pii';


--
-- Name: COLUMN nths_advisors.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.updated_at IS 'not_pii';


--
-- Name: COLUMN nths_advisors.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_advisors.school_id IS 'pii: Foreign key to upchieve.schools';


--
-- Name: nths_candidate_applications; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_candidate_applications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    status upchieve.nths_candidate_application_status NOT NULL,
    denied_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reason_must_be_null_when_not_denied CHECK (
CASE
    WHEN (status <> 'denied'::upchieve.nths_candidate_application_status) THEN (denied_notes IS NULL)
    ELSE true
END),
    CONSTRAINT reason_required_when_denied CHECK (
CASE
    WHEN (status = 'denied'::upchieve.nths_candidate_application_status) THEN (denied_notes IS NOT NULL)
    ELSE true
END)
);


--
-- Name: TABLE nths_candidate_applications; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_candidate_applications IS 'Applications submitted by students to join an NTHS chapter';


--
-- Name: COLUMN nths_candidate_applications.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_candidate_applications.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN nths_candidate_applications.status; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.status IS 'not_pii: Application status (applied, approved, or denied)';


--
-- Name: COLUMN nths_candidate_applications.denied_notes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.denied_notes IS 'pii: Notes explaining why the application was denied';


--
-- Name: COLUMN nths_candidate_applications.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.created_at IS 'not_pii';


--
-- Name: COLUMN nths_candidate_applications.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_candidate_applications.updated_at IS 'not_pii';


--
-- Name: nths_candidate_applications_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_candidate_applications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_candidate_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nths_chapter_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_chapter_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_chapter_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_chapter_statuses IS 'Reference table of statuses for an NTHS chapter';


--
-- Name: COLUMN nths_chapter_statuses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapter_statuses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_chapter_statuses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapter_statuses.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN nths_chapter_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapter_statuses.created_at IS 'not_pii';


--
-- Name: nths_chapter_statuses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_chapter_statuses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_chapter_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nths_chapters_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_chapters_statuses (
    nths_group_id uuid NOT NULL,
    nths_chapter_status_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_chapters_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_chapters_statuses IS 'Join table tracking the current and historical statuses of NTHS chapters';


--
-- Name: COLUMN nths_chapters_statuses.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapters_statuses.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_chapters_statuses.nths_chapter_status_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapters_statuses.nths_chapter_status_id IS 'not_pii: Foreign key to upchieve.nths_chapter_statuses';


--
-- Name: COLUMN nths_chapters_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_chapters_statuses.created_at IS 'not_pii';


--
-- Name: nths_group_actions; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_group_actions (
    id integer NOT NULL,
    nths_group_id uuid,
    nths_action_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_group_actions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_group_actions IS 'Records of actions that have been completed by an NTHS group';


--
-- Name: COLUMN nths_group_actions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_actions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_group_actions.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_actions.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_group_actions.nths_action_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_actions.nths_action_id IS 'not_pii: Foreign key to upchieve.nths_actions';


--
-- Name: COLUMN nths_group_actions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_actions.created_at IS 'not_pii';


--
-- Name: nths_group_actions_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_group_actions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_group_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nths_group_member_roles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_group_member_roles (
    user_id uuid NOT NULL,
    nths_group_id uuid NOT NULL,
    role_id integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_group_member_roles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_group_member_roles IS 'Roles assigned to members within an NTHS group';


--
-- Name: COLUMN nths_group_member_roles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_member_roles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN nths_group_member_roles.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_member_roles.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_group_member_roles.role_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_member_roles.role_id IS 'not_pii: Foreign key to upchieve.nths_group_roles';


--
-- Name: COLUMN nths_group_member_roles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_member_roles.updated_at IS 'not_pii: Timestamp when the record was last updated';


--
-- Name: nths_group_members; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_group_members (
    nths_group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deactivated_at timestamp with time zone
);


--
-- Name: TABLE nths_group_members; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_group_members IS 'Users who are members of an NTHS group';


--
-- Name: COLUMN nths_group_members.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_group_members.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN nths_group_members.title; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.title IS 'not_pii: Title of the user in the NTHS group';


--
-- Name: COLUMN nths_group_members.joined_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.joined_at IS 'not_pii: Timestamp when the member joined the group';


--
-- Name: COLUMN nths_group_members.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.updated_at IS 'not_pii: Timestamp when the record was last updated';


--
-- Name: COLUMN nths_group_members.deactivated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_members.deactivated_at IS 'not_pii: Timestamp when the membership was deactivated';


--
-- Name: nths_group_roles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_group_roles (
    id integer NOT NULL,
    name character varying(20)
);


--
-- Name: TABLE nths_group_roles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_group_roles IS 'Reference table of roles a member can hold within an NTHS group';


--
-- Name: COLUMN nths_group_roles.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_roles.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_group_roles.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_roles.name IS 'not_pii: Human-readable name';


--
-- Name: nths_group_roles_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_group_roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_group_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nths_group_school_affiliation; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_group_school_affiliation (
    nths_group_id uuid NOT NULL,
    nths_school_affiliation_status_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    school_id uuid
);


--
-- Name: TABLE nths_group_school_affiliation; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_group_school_affiliation IS 'Association between an NTHS group and a school';


--
-- Name: COLUMN nths_group_school_affiliation.nths_group_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';


--
-- Name: COLUMN nths_group_school_affiliation.nths_school_affiliation_status_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.nths_school_affiliation_status_id IS 'not_pii: Foreign key to upchieve.nths_school_affiliation_statuses';


--
-- Name: COLUMN nths_group_school_affiliation.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.created_at IS 'not_pii';


--
-- Name: COLUMN nths_group_school_affiliation.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.updated_at IS 'not_pii';


--
-- Name: COLUMN nths_group_school_affiliation.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_group_school_affiliation.school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: nths_groups; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_groups (
    id uuid NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    invite_code character varying(6) NOT NULL
);


--
-- Name: TABLE nths_groups; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_groups IS 'NTHS (National Technical Honor Society) chapters on the platform';


--
-- Name: COLUMN nths_groups.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_groups.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN nths_groups.key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.key IS 'not_pii: Unique URL-safe slug';


--
-- Name: COLUMN nths_groups.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.created_at IS 'not_pii';


--
-- Name: COLUMN nths_groups.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.updated_at IS 'not_pii';


--
-- Name: COLUMN nths_groups.invite_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_groups.invite_code IS 'not_pii: Short invite code for joining the NTHS group';


--
-- Name: nths_school_affiliation_statuses; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.nths_school_affiliation_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE nths_school_affiliation_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.nths_school_affiliation_statuses IS 'Reference table of statuses for an NTHS chapter''s school affiliation';


--
-- Name: COLUMN nths_school_affiliation_statuses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN nths_school_affiliation_statuses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN nths_school_affiliation_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.nths_school_affiliation_statuses.created_at IS 'not_pii';


--
-- Name: nths_school_affiliation_statuses_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.nths_school_affiliation_statuses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.nths_school_affiliation_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
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
-- Name: TABLE parents_guardians; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.parents_guardians IS 'Parent or guardian contacts associated with student accounts';


--
-- Name: COLUMN parents_guardians.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians.id IS 'not_pii: Primary key';


--
-- Name: COLUMN parents_guardians.email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians.email IS 'pii: Parent/guardian email address';


--
-- Name: COLUMN parents_guardians.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians.created_at IS 'not_pii';


--
-- Name: COLUMN parents_guardians.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians.updated_at IS 'not_pii';


--
-- Name: parents_guardians_students; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.parents_guardians_students (
    parents_guardians_id uuid NOT NULL,
    students_id uuid NOT NULL
);


--
-- Name: TABLE parents_guardians_students; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.parents_guardians_students IS 'Join table linking parents or guardians to their students';


--
-- Name: COLUMN parents_guardians_students.parents_guardians_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians_students.parents_guardians_id IS 'not_pii: Foreign key to upchieve.parents_guardians';


--
-- Name: COLUMN parents_guardians_students.students_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.parents_guardians_students.students_id IS 'not_pii: Foreign key to upchieve.users (the student)';


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
-- Name: TABLE photo_id_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.photo_id_statuses IS 'Reference table of statuses for a volunteer''s photo ID review';


--
-- Name: COLUMN photo_id_statuses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.photo_id_statuses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN photo_id_statuses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.photo_id_statuses.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN photo_id_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.photo_id_statuses.created_at IS 'not_pii';


--
-- Name: COLUMN photo_id_statuses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.photo_id_statuses.updated_at IS 'not_pii';


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
-- Name: TABLE postal_codes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.postal_codes IS 'US zip codes with income and geographic data used to determine student eligibility';


--
-- Name: COLUMN postal_codes.code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.code IS 'not_pii: The US zipcode';


--
-- Name: COLUMN postal_codes.us_state_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.us_state_code IS 'not_pii: Two-letter US state code';


--
-- Name: COLUMN postal_codes.income; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.income IS 'not_pii: Median household income for the postal code area';


--
-- Name: COLUMN postal_codes.location; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.location IS 'not_pii: Geographic point coordinates of the postal code centroid';


--
-- Name: COLUMN postal_codes.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.created_at IS 'not_pii';


--
-- Name: COLUMN postal_codes.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.updated_at IS 'not_pii';


--
-- Name: COLUMN postal_codes.cbsa_income; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.cbsa_income IS 'not_pii: Median income for the Core Based Statistical Area';


--
-- Name: COLUMN postal_codes.state_income; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.postal_codes.state_income IS 'not_pii: Median income for the state';


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
-- Name: TABLE pre_session_surveys; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.pre_session_surveys IS '@deprecated - use upchieve.users_surveys; legacy student surveys completed before a tutoring session begins';


--
-- Name: COLUMN pre_session_surveys.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.id IS 'not_pii: Primary key';


--
-- Name: COLUMN pre_session_surveys.response_data; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.response_data IS 'not_pii: JSON blob of survey response data';


--
-- Name: COLUMN pre_session_surveys.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN pre_session_surveys.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN pre_session_surveys.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.created_at IS 'not_pii';


--
-- Name: COLUMN pre_session_surveys.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.updated_at IS 'not_pii';


--
-- Name: COLUMN pre_session_surveys.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.pre_session_surveys.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE progress_report_analysis_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_analysis_types IS 'Reference table of analysis types used in progress report generation';


--
-- Name: COLUMN progress_report_analysis_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_analysis_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_analysis_types.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_analysis_types.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN progress_report_analysis_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_analysis_types.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_analysis_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_analysis_types.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_concept_details; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_concept_details IS 'AI-generated detail content for individual concepts within a progress report';


--
-- Name: COLUMN progress_report_concept_details.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_concept_details.content; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.content IS 'not_pii: AI-generated detail text (may contain student context)';


--
-- Name: COLUMN progress_report_concept_details.progress_report_concept_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_concept_id IS 'not_pii: Foreign key to upchieve.progress_report_concepts';


--
-- Name: COLUMN progress_report_concept_details.progress_report_focus_area_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_focus_area_id IS 'not_pii: Foreign key to upchieve.progress_report_focus_areas';


--
-- Name: COLUMN progress_report_concept_details.progress_report_info_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.progress_report_info_type_id IS 'not_pii: Foreign key to upchieve.progress_report_info_types';


--
-- Name: COLUMN progress_report_concept_details.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_concept_details.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concept_details.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_concepts; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_concepts IS 'Individual academic concepts identified and graded in a student progress report';


--
-- Name: COLUMN progress_report_concepts.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_concepts.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.name IS 'not_pii: Name of the academic concept covered in the report';


--
-- Name: COLUMN progress_report_concepts.description; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.description IS 'not_pii: AI-generated description of the concept (may contain student context)';


--
-- Name: COLUMN progress_report_concepts.grade; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.grade IS 'not_pii: Numeric performance grade (percentage)';


--
-- Name: COLUMN progress_report_concepts.progress_report_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';


--
-- Name: COLUMN progress_report_concepts.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_concepts.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_concepts.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_focus_areas; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_focus_areas IS 'Reference table of focus areas in progress reports (e.g. strengths, areas to improve)';


--
-- Name: COLUMN progress_report_focus_areas.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_focus_areas.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_focus_areas.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_focus_areas.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN progress_report_focus_areas.display_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_focus_areas.display_name IS 'not_pii: User-facing display name';


--
-- Name: COLUMN progress_report_focus_areas.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_focus_areas.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_focus_areas.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_focus_areas.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_info_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_info_types IS 'Reference table of information types within progress report details (e.g. tips, explanations)';


--
-- Name: COLUMN progress_report_info_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_info_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_info_types.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_info_types.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN progress_report_info_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_info_types.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_info_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_info_types.updated_at IS 'not_pii';


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
-- Name: progress_report_prompts; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_report_prompts (
    id integer NOT NULL,
    subject_id integer NOT NULL,
    prompt text NOT NULL,
    active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE progress_report_prompts; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_prompts IS 'AI prompts used to generate student progress reports';


--
-- Name: COLUMN progress_report_prompts.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_prompts.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN progress_report_prompts.prompt; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.prompt IS 'not_pii: Prompt text sent to the AI model';


--
-- Name: COLUMN progress_report_prompts.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.active IS 'not_pii: Whether the record is currently active';


--
-- Name: COLUMN progress_report_prompts.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_prompts.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_prompts.updated_at IS 'not_pii';


--
-- Name: progress_report_prompts_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.progress_report_prompts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_report_prompts_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.progress_report_prompts_id_seq OWNED BY upchieve.progress_report_prompts.id;


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
-- Name: TABLE progress_report_sessions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_sessions IS 'Sessions included in the analysis for a given progress report';


--
-- Name: COLUMN progress_report_sessions.progress_report_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_sessions.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';


--
-- Name: COLUMN progress_report_sessions.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_sessions.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN progress_report_sessions.progress_report_analysis_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_sessions.progress_report_analysis_type_id IS 'not_pii: Foreign key to upchieve.progress_report_analysis_types';


--
-- Name: COLUMN progress_report_sessions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_sessions.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_sessions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_sessions.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_statuses IS 'Reference table of statuses for a progress report (e.g. pending, complete, error)';


--
-- Name: COLUMN progress_report_statuses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_statuses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_statuses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_statuses.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN progress_report_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_statuses.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_statuses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_statuses.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_summaries; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_summaries IS 'AI-generated overall summaries for student progress reports';


--
-- Name: COLUMN progress_report_summaries.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_summaries.summary; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.summary IS 'not_pii: AI-generated summary text (may contain student context)';


--
-- Name: COLUMN progress_report_summaries.overall_grade; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.overall_grade IS 'not_pii: Aggregate percentage performance grade';


--
-- Name: COLUMN progress_report_summaries.progress_report_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';


--
-- Name: COLUMN progress_report_summaries.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_summaries.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summaries.updated_at IS 'not_pii';


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
-- Name: TABLE progress_report_summary_details; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_report_summary_details IS 'AI-generated detail content for sections of a progress report summary';


--
-- Name: COLUMN progress_report_summary_details.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_report_summary_details.content; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.content IS 'not_pii: AI-generated summary detail text (may contain student context)';


--
-- Name: COLUMN progress_report_summary_details.progress_report_summary_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_summary_id IS 'not_pii: Foreign key to upchieve.progress_report_summaries';


--
-- Name: COLUMN progress_report_summary_details.progress_report_focus_area_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_focus_area_id IS 'not_pii: Foreign key to upchieve.progress_report_focus_areas';


--
-- Name: COLUMN progress_report_summary_details.progress_report_info_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.progress_report_info_type_id IS 'not_pii: Foreign key to upchieve.progress_report_info_types';


--
-- Name: COLUMN progress_report_summary_details.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.created_at IS 'not_pii';


--
-- Name: COLUMN progress_report_summary_details.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_report_summary_details.updated_at IS 'not_pii';


--
-- Name: progress_reports; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.progress_reports (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    status_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    prompt_id integer
);


--
-- Name: TABLE progress_reports; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.progress_reports IS 'AI-generated reports on a student''s academic progress across recent sessions';


--
-- Name: COLUMN progress_reports.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.id IS 'not_pii: Primary key';


--
-- Name: COLUMN progress_reports.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN progress_reports.status_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.status_id IS 'not_pii: Foreign key to upchieve.progress_report_statuses';


--
-- Name: COLUMN progress_reports.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.created_at IS 'not_pii';


--
-- Name: COLUMN progress_reports.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.updated_at IS 'not_pii';


--
-- Name: COLUMN progress_reports.read_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.read_at IS 'not_pii: Timestamp when the user first read the report';


--
-- Name: COLUMN progress_reports.prompt_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.progress_reports.prompt_id IS 'not_pii: Foreign key to upchieve.progress_report_prompts';


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
-- Name: TABLE push_tokens; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.push_tokens IS 'Mobile device push notification tokens registered by users';


--
-- Name: COLUMN push_tokens.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.push_tokens.id IS 'not_pii: Primary key';


--
-- Name: COLUMN push_tokens.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.push_tokens.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN push_tokens.token; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.push_tokens.token IS 'pii: Push notification device token';


--
-- Name: COLUMN push_tokens.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.push_tokens.created_at IS 'not_pii';


--
-- Name: COLUMN push_tokens.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.push_tokens.updated_at IS 'not_pii';


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
-- Name: TABLE question_tags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.question_tags IS '@deprecated? It''s an empty table';


--
-- Name: COLUMN question_tags.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_tags.id IS 'not_pii: Primary key';


--
-- Name: COLUMN question_tags.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_tags.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN question_tags.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_tags.created_at IS 'not_pii';


--
-- Name: COLUMN question_tags.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_tags.updated_at IS 'not_pii';


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
-- Name: TABLE question_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.question_types IS 'Reference table of question types used in surveys (e.g. multiple choice, rating)';


--
-- Name: COLUMN question_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN question_types.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_types.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN question_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_types.created_at IS 'not_pii';


--
-- Name: COLUMN question_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.question_types.updated_at IS 'not_pii';


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
-- Name: TABLE quiz_certification_grants; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.quiz_certification_grants IS 'Join table mapping quizzes to the certifications they grant to volunteers upon passing';


--
-- Name: COLUMN quiz_certification_grants.quiz_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_certification_grants.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';


--
-- Name: COLUMN quiz_certification_grants.certification_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_certification_grants.certification_id IS 'not_pii: Foreign key to upchieve.certifications';


--
-- Name: COLUMN quiz_certification_grants.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_certification_grants.created_at IS 'not_pii';


--
-- Name: COLUMN quiz_certification_grants.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_certification_grants.updated_at IS 'not_pii';


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
-- Name: TABLE quiz_questions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.quiz_questions IS 'Questions used in volunteer certification quizzes';


--
-- Name: COLUMN quiz_questions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN quiz_questions.question_text; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.question_text IS 'not_pii: Text of the quiz question';


--
-- Name: COLUMN quiz_questions.possible_answers; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.possible_answers IS 'not_pii: JSON array of possible answer options';


--
-- Name: COLUMN quiz_questions.correct_answer; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.correct_answer IS 'not_pii: The correct answer text';


--
-- Name: COLUMN quiz_questions.quiz_subcategory_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.quiz_subcategory_id IS 'not_pii: Foreign key to upchieve.quiz_subcategories';


--
-- Name: COLUMN quiz_questions.image_source; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.image_source IS 'not_pii: URL or path to an image associated with the quiz question';


--
-- Name: COLUMN quiz_questions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.created_at IS 'not_pii';


--
-- Name: COLUMN quiz_questions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.updated_at IS 'not_pii';


--
-- Name: COLUMN quiz_questions.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_questions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE quiz_review_materials; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.quiz_review_materials IS 'Study materials provided to help volunteers prepare for a certification quiz';


--
-- Name: COLUMN quiz_review_materials.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.id IS 'not_pii: Primary key';


--
-- Name: COLUMN quiz_review_materials.quiz_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';


--
-- Name: COLUMN quiz_review_materials.title; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.title IS 'not_pii: Title of the record';


--
-- Name: COLUMN quiz_review_materials.pdf; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.pdf IS 'not_pii: URL or path to the review material PDF';


--
-- Name: COLUMN quiz_review_materials.image; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.image IS 'not_pii: URL or path to the review material cover image';


--
-- Name: COLUMN quiz_review_materials.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.created_at IS 'not_pii';


--
-- Name: COLUMN quiz_review_materials.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_review_materials.updated_at IS 'not_pii';


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
-- Name: TABLE quiz_subcategories; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.quiz_subcategories IS 'Subcategories that organize questions within a certification quiz';


--
-- Name: COLUMN quiz_subcategories.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_subcategories.id IS 'not_pii: Primary key';


--
-- Name: COLUMN quiz_subcategories.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_subcategories.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN quiz_subcategories.quiz_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_subcategories.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';


--
-- Name: COLUMN quiz_subcategories.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_subcategories.created_at IS 'not_pii';


--
-- Name: COLUMN quiz_subcategories.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quiz_subcategories.updated_at IS 'not_pii';


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
-- Name: TABLE quizzes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.quizzes IS 'Certification quizzes volunteers take to unlock the ability to tutor specific subjects';


--
-- Name: COLUMN quizzes.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.id IS 'not_pii: Primary key';


--
-- Name: COLUMN quizzes.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN quizzes.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.created_at IS 'not_pii';


--
-- Name: COLUMN quizzes.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.updated_at IS 'not_pii';


--
-- Name: COLUMN quizzes.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.active IS 'not_pii: Whether this quiz is currently available to volunteers';


--
-- Name: COLUMN quizzes.questions_per_subcategory; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.quizzes.questions_per_subcategory IS 'not_pii: Number of questions drawn per subcategory per quiz attempt';


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
-- Name: referrals; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.referrals (
    id integer NOT NULL,
    referred_by uuid,
    user_id uuid
);


--
-- Name: TABLE referrals; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.referrals IS 'Records of users who referred other users to the platform';


--
-- Name: COLUMN referrals.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.referrals.id IS 'not_pii: Primary key';


--
-- Name: COLUMN referrals.referred_by; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.referrals.referred_by IS 'not_pii: Foreign key to upchieve.users who made the referral';


--
-- Name: COLUMN referrals.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.referrals.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.referrals_id_seq OWNED BY upchieve.referrals.id;


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
-- Name: TABLE report_reasons; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.report_reasons IS 'Reference table of reasons a session or user can be reported';


--
-- Name: COLUMN report_reasons.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.report_reasons.id IS 'not_pii: Primary key';


--
-- Name: COLUMN report_reasons.reason; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.report_reasons.reason IS 'not_pii: Reason for the action (text or JSON)';


--
-- Name: COLUMN report_reasons.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.report_reasons.created_at IS 'not_pii';


--
-- Name: COLUMN report_reasons.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.report_reasons.updated_at IS 'not_pii';


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
-- Name: TABLE required_email_domains; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.required_email_domains IS 'Email domains required for volunteers registering with a specific volunteer partner org';


--
-- Name: COLUMN required_email_domains.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.required_email_domains.id IS 'not_pii: Primary key';


--
-- Name: COLUMN required_email_domains.domain; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.required_email_domains.domain IS 'not_pii: Domain name (e.g. example.com)';


--
-- Name: COLUMN required_email_domains.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.required_email_domains.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN required_email_domains.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.required_email_domains.created_at IS 'not_pii';


--
-- Name: COLUMN required_email_domains.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.required_email_domains.updated_at IS 'not_pii';


--
-- Name: school_nces_metadata; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.school_nces_metadata (
    school_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    school_year text,
    st text,
    sch_name text,
    lea_name text,
    leaid text,
    ncessch text,
    mcity text,
    mzip text,
    lcity text,
    lzip text,
    gslo text,
    gshi text,
    is_school_wide_title1 boolean DEFAULT false NOT NULL,
    is_title1_eligible boolean DEFAULT false NOT NULL,
    national_school_lunch_program text,
    total_students integer,
    nslp_direct_certification integer,
    frl_eligible integer,
    title1_school_status text
);


--
-- Name: TABLE school_nces_metadata; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.school_nces_metadata IS 'NCES (National Center for Education Statistics) data for schools, used to determine student eligibility';


--
-- Name: COLUMN school_nces_metadata.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN school_nces_metadata.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.created_at IS 'not_pii';


--
-- Name: COLUMN school_nces_metadata.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.updated_at IS 'not_pii';


--
-- Name: COLUMN school_nces_metadata.school_year; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.school_year IS 'not_pii: NCES school year label';


--
-- Name: COLUMN school_nces_metadata.st; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.st IS 'not_pii: NCES state abbreviation';


--
-- Name: COLUMN school_nces_metadata.sch_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.sch_name IS 'not_pii: NCES school name';


--
-- Name: COLUMN school_nces_metadata.lea_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.lea_name IS 'not_pii: NCES district name';


--
-- Name: COLUMN school_nces_metadata.leaid; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.leaid IS 'not_pii: NCES district id';


--
-- Name: COLUMN school_nces_metadata.ncessch; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.ncessch IS 'not_pii: NCES school id';


--
-- Name: COLUMN school_nces_metadata.mcity; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.mcity IS 'not_pii: NCES mailing city';


--
-- Name: COLUMN school_nces_metadata.mzip; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.mzip IS 'not_pii: NCES mailing ZIP code';


--
-- Name: COLUMN school_nces_metadata.lcity; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.lcity IS 'not_pii: NCES location city';


--
-- Name: COLUMN school_nces_metadata.lzip; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.lzip IS 'not_pii: NCES location ZIP code';


--
-- Name: COLUMN school_nces_metadata.gslo; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.gslo IS 'not_pii: Lowest grade served by the school';


--
-- Name: COLUMN school_nces_metadata.gshi; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.gshi IS 'not_pii: Highest grade served by the school';


--
-- Name: COLUMN school_nces_metadata.is_school_wide_title1; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.is_school_wide_title1 IS 'not_pii: Whether the school participates in school-wide Title I';


--
-- Name: COLUMN school_nces_metadata.is_title1_eligible; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.is_title1_eligible IS 'not_pii: Whether the school is Title I eligible';


--
-- Name: COLUMN school_nces_metadata.national_school_lunch_program; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.national_school_lunch_program IS 'not_pii: National School Lunch Program participation status';


--
-- Name: COLUMN school_nces_metadata.total_students; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.total_students IS 'not_pii: Total student enrollment';


--
-- Name: COLUMN school_nces_metadata.nslp_direct_certification; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.nslp_direct_certification IS 'not_pii: Number of students directly certified for National School Lunch Program';


--
-- Name: COLUMN school_nces_metadata.frl_eligible; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.frl_eligible IS 'not_pii: Number of students eligible for free or reduced-price lunch';


--
-- Name: COLUMN school_nces_metadata.title1_school_status; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.school_nces_metadata.title1_school_status IS 'not_pii: Title I school status label';


--
-- Name: schools; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.schools (
    id uuid NOT NULL,
    name text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    partner boolean DEFAULT false NOT NULL,
    city_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    legacy_city_name text
);


--
-- Name: TABLE schools; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.schools IS 'Schools associated with students and teachers on the platform';


--
-- Name: COLUMN schools.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.id IS 'not_pii: Primary key';


--
-- Name: COLUMN schools.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN schools.approved; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.approved IS 'not_pii: Whether the school has been approved for use on the platform';


--
-- Name: COLUMN schools.partner; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.partner IS 'not_pii: Whether the school is an official UPchieve partner school';


--
-- Name: COLUMN schools.city_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.city_id IS 'not_pii: Foreign key to upchieve.cities';


--
-- Name: COLUMN schools.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.created_at IS 'not_pii';


--
-- Name: COLUMN schools.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.updated_at IS 'not_pii';


--
-- Name: COLUMN schools.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN schools.legacy_city_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools.legacy_city_name IS 'not_pii: @deprecated - city name imported from MongoDB before the cities table existed';


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
-- Name: TABLE schools_sponsor_orgs; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.schools_sponsor_orgs IS 'Current associations between schools and the sponsor orgs that support them';


--
-- Name: COLUMN schools_sponsor_orgs.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN schools_sponsor_orgs.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN schools_sponsor_orgs.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.created_at IS 'not_pii';


--
-- Name: COLUMN schools_sponsor_orgs.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs.updated_at IS 'not_pii';


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
-- Name: TABLE schools_sponsor_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.schools_sponsor_orgs_instances IS 'Represents active/deactivated status of a school''s association with a sponsor org';


--
-- Name: COLUMN schools_sponsor_orgs_instances.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN schools_sponsor_orgs_instances.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN schools_sponsor_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN schools_sponsor_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN schools_sponsor_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.updated_at IS 'not_pii';


--
-- Name: session_audio; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_audio (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    resource_uri text,
    student_joined_at timestamp with time zone,
    volunteer_joined_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE session_audio; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_audio IS 'Tutoring sessions that used audio';


--
-- Name: COLUMN session_audio.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_audio.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_audio.resource_uri; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.resource_uri IS 'not_pii: ?? The column is always null, theoretically a link to the resource in cloud storage';


--
-- Name: COLUMN session_audio.student_joined_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.student_joined_at IS 'not_pii: Timestamp when the student joined the audio session';


--
-- Name: COLUMN session_audio.volunteer_joined_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.volunteer_joined_at IS 'not_pii: Timestamp when the volunteer joined the session';


--
-- Name: COLUMN session_audio.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.created_at IS 'not_pii';


--
-- Name: COLUMN session_audio.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio.updated_at IS 'not_pii';


--
-- Name: session_audio_transcript_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_audio_transcript_messages (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid NOT NULL,
    message text NOT NULL,
    said_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE session_audio_transcript_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_audio_transcript_messages IS 'Transcribed messages from session audio recordings';


--
-- Name: COLUMN session_audio_transcript_messages.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_audio_transcript_messages.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN session_audio_transcript_messages.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_audio_transcript_messages.message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.message IS 'not_pii: Message text content';


--
-- Name: COLUMN session_audio_transcript_messages.said_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_audio_transcript_messages.said_at IS 'not_pii: Timestamp when the audio transcript message was spoken';


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
-- Name: TABLE session_failed_joins; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_failed_joins IS 'Records of users who attempted but failed to join a session';


--
-- Name: COLUMN session_failed_joins.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_failed_joins.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_failed_joins.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_failed_joins.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN session_failed_joins.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_failed_joins.created_at IS 'not_pii';


--
-- Name: COLUMN session_failed_joins.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_failed_joins.updated_at IS 'not_pii';


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
-- Name: TABLE session_flags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_flags IS 'Reference table of flags that can be raised on a session';


--
-- Name: COLUMN session_flags.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_flags.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_flags.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_flags.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN session_flags.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_flags.created_at IS 'not_pii';


--
-- Name: COLUMN session_flags.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_flags.updated_at IS 'not_pii';


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
-- Name: session_last_seen; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_last_seen (
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    last_seen_at timestamp with time zone
);


--
-- Name: session_meetings; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_meetings (
    id uuid NOT NULL,
    external_id text NOT NULL,
    provider text NOT NULL,
    session_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    recording_id text
);


--
-- Name: TABLE session_meetings; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_meetings IS 'External audio/screenshare meeting records associated with sessions';


--
-- Name: COLUMN session_meetings.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_meetings.external_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.external_id IS 'not_pii: External meeting provider identifier';


--
-- Name: COLUMN session_meetings.provider; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.provider IS 'not_pii: Audio/screenshare meeting provider name';


--
-- Name: COLUMN session_meetings.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_meetings.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.created_at IS 'not_pii';


--
-- Name: COLUMN session_meetings.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.updated_at IS 'not_pii';


--
-- Name: COLUMN session_meetings.recording_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_meetings.recording_id IS 'not_pii: External identifier for the meeting recording';


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
-- Name: TABLE session_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_messages IS 'Chat messages sent by participants during a tutoring session';


--
-- Name: COLUMN session_messages.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_messages.sender_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';


--
-- Name: COLUMN session_messages.contents; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.contents IS 'not_pii: Text content of the chat message';


--
-- Name: COLUMN session_messages.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_messages.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.created_at IS 'not_pii';


--
-- Name: COLUMN session_messages.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.updated_at IS 'not_pii';


--
-- Name: COLUMN session_messages.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_messages.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


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
-- Name: TABLE session_photos; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_photos IS 'Photos uploaded by participants during a tutoring session';


--
-- Name: COLUMN session_photos.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_photos.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_photos.photo_key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_photos.photo_key IS 'pii: Object key for a session photo';


--
-- Name: COLUMN session_photos.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_photos.created_at IS 'not_pii';


--
-- Name: COLUMN session_photos.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_photos.updated_at IS 'not_pii';


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
-- Name: TABLE session_reports; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_reports IS 'Reports filed by users about inappropriate or concerning behaviour in a session';


--
-- Name: COLUMN session_reports.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_reports.report_reason_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.report_reason_id IS 'not_pii: Foreign key to upchieve.report_reasons';


--
-- Name: COLUMN session_reports.report_message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.report_message IS 'not_pii: Free-text message submitted with the report (may contain user content)';


--
-- Name: COLUMN session_reports.reporting_user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.reporting_user_id IS 'not_pii: Foreign key to upchieve.users who filed the report';


--
-- Name: COLUMN session_reports.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_reports.reported_user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.reported_user_id IS 'not_pii: Foreign key to upchieve.users who was reported';


--
-- Name: COLUMN session_reports.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.created_at IS 'not_pii';


--
-- Name: COLUMN session_reports.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_reports.updated_at IS 'not_pii';


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
-- Name: TABLE session_review_reasons; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_review_reasons IS 'Flags that caused a session to be queued for admin review';


--
-- Name: COLUMN session_review_reasons.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_review_reasons.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_review_reasons.session_flag_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_review_reasons.session_flag_id IS 'not_pii: Foreign key to upchieve.session_flags';


--
-- Name: COLUMN session_review_reasons.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_review_reasons.created_at IS 'not_pii';


--
-- Name: COLUMN session_review_reasons.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_review_reasons.updated_at IS 'not_pii';


--
-- Name: session_summaries; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_summaries (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    summary text NOT NULL,
    user_type_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    trace_id character varying(255)
);


--
-- Name: TABLE session_summaries; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_summaries IS 'AI-generated summaries of a completed session';


--
-- Name: COLUMN session_summaries.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_summaries.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_summaries.summary; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.summary IS 'not_pii: AI-generated summary text';


--
-- Name: COLUMN session_summaries.user_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.user_type_id IS 'not_pii: Foreign key to upchieve.user_roles; who the session summary is being generated for';


--
-- Name: COLUMN session_summaries.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.created_at IS 'not_pii';


--
-- Name: COLUMN session_summaries.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.updated_at IS 'not_pii';


--
-- Name: COLUMN session_summaries.trace_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_summaries.trace_id IS 'not_pii: Tracing ID for the AI summary generation request, used for user to provide feedback on the summary';


--
-- Name: session_voice_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.session_voice_messages (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    transcript text
);


--
-- Name: TABLE session_voice_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.session_voice_messages IS 'Voice messages sent by participants during a tutoring session';


--
-- Name: COLUMN session_voice_messages.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.id IS 'not_pii: Primary key';


--
-- Name: COLUMN session_voice_messages.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN session_voice_messages.sender_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.sender_id IS 'not_pii: Foreign key to upchieve.users (the message sender)';


--
-- Name: COLUMN session_voice_messages.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.created_at IS 'not_pii';


--
-- Name: COLUMN session_voice_messages.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.updated_at IS 'not_pii';


--
-- Name: COLUMN session_voice_messages.transcript; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.session_voice_messages.transcript IS 'not_pii: Text transcript of the voice message';


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
    reviewed boolean DEFAULT false NOT NULL,
    to_review boolean DEFAULT false NOT NULL,
    student_banned boolean,
    time_tutored bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mongo_id character varying(24),
    shadowbanned boolean,
    ended_by_user_id uuid
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sessions IS 'Tutoring sessions between a student and a volunteer';


--
-- Name: COLUMN sessions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN sessions.student_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.student_id IS 'not_pii: Foreign key to upchieve.users (the student)';


--
-- Name: COLUMN sessions.volunteer_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';


--
-- Name: COLUMN sessions.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN sessions.has_whiteboard_doc; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.has_whiteboard_doc IS 'not_pii: Whether the session has an associated whiteboard document';


--
-- Name: COLUMN sessions.quill_doc; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.quill_doc IS 'not_pii: Quill.js shared document content (user-generated text)';


--
-- Name: COLUMN sessions.volunteer_joined_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.volunteer_joined_at IS 'not_pii: Timestamp when the volunteer joined the session';


--
-- Name: COLUMN sessions.ended_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.ended_at IS 'not_pii: Timestamp when the session ended';


--
-- Name: COLUMN sessions.reviewed; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.reviewed IS 'not_pii: Whether the session has been reviewed by an admin';


--
-- Name: COLUMN sessions.to_review; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.to_review IS 'not_pii: Whether the session has been flagged for admin review';


--
-- Name: COLUMN sessions.student_banned; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.student_banned IS 'not_pii: Whether the student was banned as a result of this session';


--
-- Name: COLUMN sessions.time_tutored; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.time_tutored IS 'not_pii: Duration of active tutoring in milliseconds';


--
-- Name: COLUMN sessions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.created_at IS 'not_pii';


--
-- Name: COLUMN sessions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.updated_at IS 'not_pii';


--
-- Name: COLUMN sessions.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN sessions.shadowbanned; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.shadowbanned IS 'not_pii: Whether the student was shadow banned when requesting the session';


--
-- Name: COLUMN sessions.ended_by_user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions.ended_by_user_id IS 'not_pii: Foreign key to upchieve.users who ended the session';


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
-- Name: TABLE sessions_session_flags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sessions_session_flags IS 'Join table associating active session flags with a session';


--
-- Name: COLUMN sessions_session_flags.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_session_flags.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN sessions_session_flags.session_flag_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_session_flags.session_flag_id IS 'not_pii: Foreign key to upchieve.session_flags';


--
-- Name: COLUMN sessions_session_flags.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_session_flags.created_at IS 'not_pii';


--
-- Name: COLUMN sessions_session_flags.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_session_flags.updated_at IS 'not_pii';


--
-- Name: sessions_students_assignments; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.sessions_students_assignments (
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE sessions_students_assignments; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sessions_students_assignments IS 'Join table linking sessions to the student assignments they help fulfill';


--
-- Name: COLUMN sessions_students_assignments.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_students_assignments.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN sessions_students_assignments.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_students_assignments.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN sessions_students_assignments.assignment_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_students_assignments.assignment_id IS 'not_pii: Foreign key to upchieve.assignments';


--
-- Name: COLUMN sessions_students_assignments.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_students_assignments.created_at IS 'not_pii';


--
-- Name: COLUMN sessions_students_assignments.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sessions_students_assignments.updated_at IS 'not_pii';


--
-- Name: shareable_domains; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.shareable_domains (
    id integer NOT NULL,
    domain character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE shareable_domains; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.shareable_domains IS 'Domains of websites permitted to be shared in sessions';


--
-- Name: COLUMN shareable_domains.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.shareable_domains.id IS 'not_pii: Primary key';


--
-- Name: COLUMN shareable_domains.domain; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.shareable_domains.domain IS 'not_pii: Domain allowed in session links';


--
-- Name: COLUMN shareable_domains.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.shareable_domains.created_at IS 'not_pii';


--
-- Name: COLUMN shareable_domains.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.shareable_domains.updated_at IS 'not_pii';


--
-- Name: shareable_domains_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

CREATE SEQUENCE upchieve.shareable_domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shareable_domains_id_seq; Type: SEQUENCE OWNED BY; Schema: upchieve; Owner: -
--

ALTER SEQUENCE upchieve.shareable_domains_id_seq OWNED BY upchieve.shareable_domains.id;


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
-- Name: TABLE signup_sources; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.signup_sources IS 'Reference table of channels through which users discovered the platform';


--
-- Name: COLUMN signup_sources.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.signup_sources.id IS 'not_pii: Primary key';


--
-- Name: COLUMN signup_sources.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.signup_sources.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN signup_sources.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.signup_sources.created_at IS 'not_pii';


--
-- Name: COLUMN signup_sources.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.signup_sources.updated_at IS 'not_pii';


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
-- Name: TABLE sponsor_orgs; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sponsor_orgs IS 'Organizations that fund or sponsor student access to the platform';


--
-- Name: COLUMN sponsor_orgs.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs.id IS 'not_pii: Primary key';


--
-- Name: COLUMN sponsor_orgs.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN sponsor_orgs.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs.created_at IS 'not_pii';


--
-- Name: COLUMN sponsor_orgs.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs.updated_at IS 'not_pii';


--
-- Name: COLUMN sponsor_orgs.key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs.key IS 'not_pii: Unique URL-safe slug';


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
-- Name: TABLE sponsor_orgs_upchieve_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sponsor_orgs_upchieve_instances IS 'Represents active/deactivated status of a sponsor orgs';


--
-- Name: COLUMN sponsor_orgs_upchieve_instances.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.id IS 'not_pii: Primary key';


--
-- Name: COLUMN sponsor_orgs_upchieve_instances.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN sponsor_orgs_upchieve_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN sponsor_orgs_upchieve_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.created_at IS 'not_pii';


--
-- Name: COLUMN sponsor_orgs_upchieve_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_upchieve_instances.updated_at IS 'not_pii';


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
-- Name: TABLE sponsor_orgs_volunteer_partner_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances IS 'Represents active/deactivated status of associations between sponsor orgs and volunteer partner orgs';


--
-- Name: COLUMN sponsor_orgs_volunteer_partner_orgs_instances.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN sponsor_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN sponsor_orgs_volunteer_partner_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN sponsor_orgs_volunteer_partner_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN sponsor_orgs_volunteer_partner_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.updated_at IS 'not_pii';


--
-- Name: student_classes; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_classes (
    user_id uuid NOT NULL,
    class_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE student_classes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_classes IS 'Join table enrolling students in a teacher''s class';


--
-- Name: COLUMN student_classes.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_classes.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN student_classes.class_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_classes.class_id IS 'not_pii: Foreign key to upchieve.teacher_classes';


--
-- Name: COLUMN student_classes.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_classes.created_at IS 'not_pii';


--
-- Name: COLUMN student_classes.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_classes.updated_at IS 'not_pii';


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
-- Name: TABLE student_favorite_volunteers; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_favorite_volunteers IS 'Volunteers that a student has marked as favourites';


--
-- Name: COLUMN student_favorite_volunteers.student_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_favorite_volunteers.student_id IS 'not_pii: Foreign key to upchieve.users (the student)';


--
-- Name: COLUMN student_favorite_volunteers.volunteer_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_favorite_volunteers.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';


--
-- Name: COLUMN student_favorite_volunteers.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_favorite_volunteers.created_at IS 'not_pii';


--
-- Name: COLUMN student_favorite_volunteers.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_favorite_volunteers.updated_at IS 'not_pii';


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
-- Name: TABLE student_partner_org_sites; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_org_sites IS 'Physical or programmatic sites within a student partner organization';


--
-- Name: COLUMN student_partner_org_sites.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_org_sites.id IS 'not_pii: Primary key';


--
-- Name: COLUMN student_partner_org_sites.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_org_sites.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN student_partner_org_sites.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_org_sites.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN student_partner_org_sites.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_org_sites.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_org_sites.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_org_sites.updated_at IS 'not_pii';


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
-- Name: TABLE student_partner_orgs; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_orgs IS 'Student partner organizations partner with UPchieve to give access to their students';


--
-- Name: COLUMN student_partner_orgs.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.id IS 'not_pii: Primary key';


--
-- Name: COLUMN student_partner_orgs.key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.key IS 'not_pii: Unique URL-safe slug';


--
-- Name: COLUMN student_partner_orgs.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN student_partner_orgs.signup_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.signup_code IS 'not_pii: Invite code required to register with this partner org';


--
-- Name: COLUMN student_partner_orgs.high_school_signup; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.high_school_signup IS 'not_pii: Whether high school students may register with this org';


--
-- Name: COLUMN student_partner_orgs.college_signup; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.college_signup IS 'not_pii: Whether college students may register with this org';


--
-- Name: COLUMN student_partner_orgs.school_signup_required; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.school_signup_required IS 'not_pii: Whether students must select a school during registration';


--
-- Name: COLUMN student_partner_orgs.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.updated_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs.school_id IS 'not_pii: Foreign key to upchieve.schools';


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
-- Name: TABLE student_partner_orgs_sponsor_orgs; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_orgs_sponsor_orgs IS '@deprecated? Use upchieve.student_partner_orgs_sponsor_orgs_instances; Represents associations between student partner orgs and sponsor orgs';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs.updated_at IS 'not_pii';


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
-- Name: TABLE student_partner_orgs_sponsor_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_orgs_sponsor_orgs_instances IS 'Represents active/deactivated status of associations between a student partner org and sponsor org';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs_instances.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs_instances.sponsor_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.sponsor_org_id IS 'not_pii: Foreign key to upchieve.sponsor_orgs';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs_sponsor_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.updated_at IS 'not_pii';


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
-- Name: TABLE student_partner_orgs_upchieve_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_orgs_upchieve_instances IS 'Represents active/deactivated status of a student partner orgs';


--
-- Name: COLUMN student_partner_orgs_upchieve_instances.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.id IS 'not_pii: Primary key';


--
-- Name: COLUMN student_partner_orgs_upchieve_instances.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN student_partner_orgs_upchieve_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN student_partner_orgs_upchieve_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs_upchieve_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_upchieve_instances.updated_at IS 'not_pii';


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
-- Name: TABLE student_partner_orgs_volunteer_partner_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_partner_orgs_volunteer_partner_orgs_instances IS '???';


--
-- Name: COLUMN student_partner_orgs_volunteer_partner_orgs_instances.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN student_partner_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN student_partner_orgs_volunteer_partner_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN student_partner_orgs_volunteer_partner_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN student_partner_orgs_volunteer_partner_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.updated_at IS 'not_pii';


--
-- Name: student_profiles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.student_profiles (
    user_id uuid NOT NULL,
    college text,
    school_id uuid,
    postal_code text,
    student_partner_org_user_id text,
    student_partner_org_id uuid,
    student_partner_org_site_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE student_profiles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.student_profiles IS 'Profile data for student users';


--
-- Name: COLUMN student_profiles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN student_profiles.college; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.college IS 'pii: College or university name';


--
-- Name: COLUMN student_profiles.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.school_id IS 'pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN student_profiles.postal_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.postal_code IS 'pii: US postal/ZIP code';


--
-- Name: COLUMN student_profiles.student_partner_org_user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_user_id IS 'not_pii: @deprecated';


--
-- Name: COLUMN student_profiles.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_id IS 'pii: Foreign key to upchieve.student_partner_orgs; the student partner org of the student';


--
-- Name: COLUMN student_profiles.student_partner_org_site_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.student_partner_org_site_id IS 'pii: Foreign key to upchieve.student_partner_org_sites; if applicable, the site of the student partner org for this student';


--
-- Name: COLUMN student_profiles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.created_at IS 'not_pii';


--
-- Name: COLUMN student_profiles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.student_profiles.updated_at IS 'not_pii';


--
-- Name: students_assignments; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.students_assignments (
    user_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE students_assignments; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.students_assignments IS 'Join table tracking student assignment submissions and completion';


--
-- Name: COLUMN students_assignments.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.students_assignments.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN students_assignments.assignment_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.students_assignments.assignment_id IS 'not_pii: Foreign key to upchieve.assignments';


--
-- Name: COLUMN students_assignments.submitted_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.students_assignments.submitted_at IS 'not_pii: Timestamp when the student submitted the assignment';


--
-- Name: COLUMN students_assignments.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.students_assignments.created_at IS 'not_pii';


--
-- Name: COLUMN students_assignments.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.students_assignments.updated_at IS 'not_pii';


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
-- Name: TABLE subjects; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.subjects IS 'Tutoring subjects available on the platform';


--
-- Name: COLUMN subjects.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.id IS 'not_pii: Primary key';


--
-- Name: COLUMN subjects.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN subjects.display_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.display_name IS 'not_pii: User-facing display name';


--
-- Name: COLUMN subjects.display_order; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.display_order IS 'not_pii: Sort order for UI display';


--
-- Name: COLUMN subjects.topic_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.topic_id IS 'not_pii: Foreign key to upchieve.topics';


--
-- Name: COLUMN subjects.tool_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.tool_type_id IS 'not_pii: Foreign key to upchieve.tool_types';


--
-- Name: COLUMN subjects.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.created_at IS 'not_pii';


--
-- Name: COLUMN subjects.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.updated_at IS 'not_pii';


--
-- Name: COLUMN subjects.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.subjects.active IS 'not_pii: Whether the subject is currently active';


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
-- Name: TABLE survey_questions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.survey_questions IS 'Questions used in surveys';


--
-- Name: COLUMN survey_questions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN survey_questions.question_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.question_type_id IS 'not_pii: Foreign key to upchieve.question_types';


--
-- Name: COLUMN survey_questions.question_text; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.question_text IS 'not_pii: Text of the quiz question';


--
-- Name: COLUMN survey_questions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.created_at IS 'not_pii';


--
-- Name: COLUMN survey_questions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.updated_at IS 'not_pii';


--
-- Name: COLUMN survey_questions.response_display_text; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.response_display_text IS 'not_pii: Text shown alongside the response in reporting views';


--
-- Name: COLUMN survey_questions.replacement_column_1; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.replacement_column_1 IS 'not_pii: First dynamic replacement value for question text templating';


--
-- Name: COLUMN survey_questions.replacement_column_2; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions.replacement_column_2 IS 'not_pii: Second dynamic replacement value for question text templating';


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
-- Name: TABLE survey_questions_question_tags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.survey_questions_question_tags IS '@deprecated? Just an empty table';


--
-- Name: COLUMN survey_questions_question_tags.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_question_tags.id IS 'not_pii: Primary key';


--
-- Name: COLUMN survey_questions_question_tags.survey_question_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_question_tags.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';


--
-- Name: COLUMN survey_questions_question_tags.question_tag_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_question_tags.question_tag_id IS 'not_pii: Foreign key to upchieve.question_tags';


--
-- Name: COLUMN survey_questions_question_tags.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_question_tags.created_at IS 'not_pii';


--
-- Name: COLUMN survey_questions_question_tags.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_question_tags.updated_at IS 'not_pii';


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
-- Name: TABLE survey_questions_response_choices; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.survey_questions_response_choices IS 'Join table linking survey questions to their available response options';


--
-- Name: COLUMN survey_questions_response_choices.response_choice_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_response_choices.response_choice_id IS 'not_pii: Foreign key to upchieve.survey_response_choices';


--
-- Name: COLUMN survey_questions_response_choices.display_priority; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_response_choices.display_priority IS 'not_pii: Sort order for display in the UI';


--
-- Name: COLUMN survey_questions_response_choices.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_response_choices.created_at IS 'not_pii';


--
-- Name: COLUMN survey_questions_response_choices.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_response_choices.updated_at IS 'not_pii';


--
-- Name: COLUMN survey_questions_response_choices.surveys_survey_question_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_questions_response_choices.surveys_survey_question_id IS 'not_pii: Foreign key to upchieve.surveys_survey_questions';


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
-- Name: TABLE survey_response_choices; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.survey_response_choices IS 'Response choices available for survey questions';


--
-- Name: COLUMN survey_response_choices.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.id IS 'not_pii: Primary key';


--
-- Name: COLUMN survey_response_choices.score; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.score IS 'not_pii: Numeric score for the survey response choice';


--
-- Name: COLUMN survey_response_choices.choice_text; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.choice_text IS 'not_pii: Display text for the survey response choice';


--
-- Name: COLUMN survey_response_choices.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.created_at IS 'not_pii';


--
-- Name: COLUMN survey_response_choices.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.updated_at IS 'not_pii';


--
-- Name: COLUMN survey_response_choices.display_image; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_response_choices.display_image IS 'not_pii: URL or path to an image displayed alongside the choice';


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
-- Name: TABLE survey_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.survey_types IS 'Reference table of survey types (e.g. pre-session, post-session, progress report)';


--
-- Name: COLUMN survey_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN survey_types.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_types.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN survey_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_types.created_at IS 'not_pii';


--
-- Name: COLUMN survey_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.survey_types.updated_at IS 'not_pii';


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
    role_id integer,
    reward_amount integer
);


--
-- Name: TABLE surveys; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.surveys IS 'Surveys administered to users on the platform';


--
-- Name: COLUMN surveys.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.id IS 'not_pii: Primary key';


--
-- Name: COLUMN surveys.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN surveys.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.created_at IS 'not_pii';


--
-- Name: COLUMN surveys.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.updated_at IS 'not_pii';


--
-- Name: COLUMN surveys.role_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.role_id IS 'not_pii: Foreign key to upchieve.user_roles';


--
-- Name: COLUMN surveys.reward_amount; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys.reward_amount IS 'not_pii: Gift card reward in cents for completing the survey';


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
-- Name: TABLE surveys_context; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.surveys_context IS 'Defines which surveys apply to which subjects and survey types';


--
-- Name: COLUMN surveys_context.survey_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_context.survey_id IS 'not_pii: Foreign key to upchieve.surveys';


--
-- Name: COLUMN surveys_context.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_context.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: COLUMN surveys_context.survey_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_context.survey_type_id IS 'not_pii: Foreign key to upchieve.survey_types';


--
-- Name: COLUMN surveys_context.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_context.created_at IS 'not_pii';


--
-- Name: COLUMN surveys_context.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_context.updated_at IS 'not_pii';


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
-- Name: TABLE surveys_survey_questions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.surveys_survey_questions IS 'Join table ordering questions within a survey';


--
-- Name: COLUMN surveys_survey_questions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN surveys_survey_questions.survey_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.survey_id IS 'not_pii: Foreign key to upchieve.surveys';


--
-- Name: COLUMN surveys_survey_questions.survey_question_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';


--
-- Name: COLUMN surveys_survey_questions.display_priority; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.display_priority IS 'not_pii: Sort order for display in the UI';


--
-- Name: COLUMN surveys_survey_questions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.created_at IS 'not_pii';


--
-- Name: COLUMN surveys_survey_questions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.surveys_survey_questions.updated_at IS 'not_pii';


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
-- Name: table_descriptions; Type: VIEW; Schema: upchieve; Owner: -
--

CREATE VIEW upchieve.table_descriptions AS
 SELECT pg_class.relname AS table_name,
    pg_description.description
   FROM ((pg_class
     JOIN pg_namespace ON ((pg_namespace.oid = pg_class.relnamespace)))
     JOIN pg_description ON (((pg_description.objoid = pg_class.oid) AND (pg_description.objsubid = 0))))
  WHERE ((pg_namespace.nspname = 'upchieve'::name) AND (pg_class.relkind = 'r'::"char"));


--
-- Name: teacher_classes; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.teacher_classes (
    id uuid NOT NULL,
    user_id uuid,
    name text NOT NULL,
    code text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    topic_id integer,
    deactivated_on timestamp with time zone,
    clever_id text
);


--
-- Name: TABLE teacher_classes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.teacher_classes IS 'Classes created by teachers for enrolling their students';


--
-- Name: COLUMN teacher_classes.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.id IS 'not_pii: Primary key';


--
-- Name: COLUMN teacher_classes.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN teacher_classes.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.name IS 'not_pii: Name of the teacher class';


--
-- Name: COLUMN teacher_classes.code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.code IS 'not_pii: Student-facing join code for the teacher class';


--
-- Name: COLUMN teacher_classes.active; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.active IS 'not_pii: Whether the class is currently active';


--
-- Name: COLUMN teacher_classes.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.created_at IS 'not_pii';


--
-- Name: COLUMN teacher_classes.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.updated_at IS 'not_pii';


--
-- Name: COLUMN teacher_classes.topic_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.topic_id IS 'not_pii: Foreign key to upchieve.topics';


--
-- Name: COLUMN teacher_classes.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN teacher_classes.clever_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_classes.clever_id IS 'not_pii: Clever LMS class identifier';


--
-- Name: teacher_profiles; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.teacher_profiles (
    user_id uuid NOT NULL,
    school_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    last_successful_clever_sync timestamp with time zone
);


--
-- Name: TABLE teacher_profiles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.teacher_profiles IS 'Profile data for teacher users';


--
-- Name: COLUMN teacher_profiles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN teacher_profiles.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_profiles.school_id IS 'pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN teacher_profiles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_profiles.created_at IS 'not_pii';


--
-- Name: COLUMN teacher_profiles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_profiles.updated_at IS 'not_pii';


--
-- Name: COLUMN teacher_profiles.last_successful_clever_sync; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.teacher_profiles.last_successful_clever_sync IS 'not_pii: Timestamp of the most recent successful Clever data sync';


--
-- Name: text_moderation_patterns; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.text_moderation_patterns (
    id integer NOT NULL,
    regex text NOT NULL,
    flags character varying(8),
    rules json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE text_moderation_patterns; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.text_moderation_patterns IS 'Regex patterns used for automated text content moderation';


--
-- Name: COLUMN text_moderation_patterns.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.id IS 'not_pii: Primary key';


--
-- Name: COLUMN text_moderation_patterns.regex; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.regex IS 'not_pii: Regular expression pattern used for text moderation matching';


--
-- Name: COLUMN text_moderation_patterns.flags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.flags IS 'not_pii: Regex flags applied to the pattern (e.g. i for case-insensitive)';


--
-- Name: COLUMN text_moderation_patterns.rules; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.rules IS 'not_pii: JSON moderation rules associated with this pattern';


--
-- Name: COLUMN text_moderation_patterns.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.created_at IS 'not_pii';


--
-- Name: COLUMN text_moderation_patterns.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.text_moderation_patterns.updated_at IS 'not_pii';


--
-- Name: text_moderation_patterns_id_seq; Type: SEQUENCE; Schema: upchieve; Owner: -
--

ALTER TABLE upchieve.text_moderation_patterns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME upchieve.text_moderation_patterns_id_seq
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
-- Name: TABLE tool_types; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.tool_types IS 'Reference table of session tools available during tutoring (e.g. whiteboard, document editor)';


--
-- Name: COLUMN tool_types.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tool_types.id IS 'not_pii: Primary key';


--
-- Name: COLUMN tool_types.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tool_types.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN tool_types.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tool_types.created_at IS 'not_pii';


--
-- Name: COLUMN tool_types.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tool_types.updated_at IS 'not_pii';


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
-- Name: TABLE topics; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.topics IS 'Subject topic areas that group related tutoring subjects (e.g. Math, College Counseling)';


--
-- Name: COLUMN topics.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.id IS 'not_pii: Primary key';


--
-- Name: COLUMN topics.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN topics.icon_link; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.icon_link IS 'not_pii: URL to the topic icon image';


--
-- Name: COLUMN topics.color; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.color IS 'not_pii: Hex color code associated with the topic';


--
-- Name: COLUMN topics.dashboard_order; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.dashboard_order IS 'not_pii: Sort order on the student subject dashboard';


--
-- Name: COLUMN topics.display_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.display_name IS 'not_pii: User-facing display name';


--
-- Name: COLUMN topics.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.created_at IS 'not_pii';


--
-- Name: COLUMN topics.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.updated_at IS 'not_pii';


--
-- Name: COLUMN topics.training_order; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.topics.training_order IS 'not_pii: Sort order in the volunteer training flow';


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
-- Name: totp; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.totp (
    user_id uuid NOT NULL,
    secret text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    last_used_counter integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE totp; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.totp IS 'TOTP two-factor authentication secrets and state for users';


--
-- Name: COLUMN totp.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN totp.secret; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.secret IS 'pii: Encrypted TOTP shared secret used for two-factor authentication';


--
-- Name: COLUMN totp.verified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.verified IS 'not_pii: Whether the TOTP authenticator has been verified by the user';


--
-- Name: COLUMN totp.last_used_counter; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.last_used_counter IS 'pii: TOTP counter value from the most recent successful authentication';


--
-- Name: COLUMN totp.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.created_at IS 'not_pii';


--
-- Name: COLUMN totp.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.totp.updated_at IS 'not_pii';


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
-- Name: TABLE training_courses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.training_courses IS 'Onboarding training courses that volunteers complete before they can tutor';


--
-- Name: COLUMN training_courses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.training_courses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN training_courses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.training_courses.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN training_courses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.training_courses.created_at IS 'not_pii';


--
-- Name: COLUMN training_courses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.training_courses.updated_at IS 'not_pii';


--
-- Name: COLUMN training_courses.display_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.training_courses.display_name IS 'not_pii: User-facing display name';


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
-- Name: tutor_bot_conversation_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.tutor_bot_conversation_messages (
    tutor_bot_conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    sender_user_type upchieve.tutor_bot_conversation_user_type NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE tutor_bot_conversation_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.tutor_bot_conversation_messages IS 'Messages in a AI tutor bot conversation';


--
-- Name: COLUMN tutor_bot_conversation_messages.tutor_bot_conversation_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.tutor_bot_conversation_id IS 'not_pii: Foreign key to upchieve.tutor_bot_conversations';


--
-- Name: COLUMN tutor_bot_conversation_messages.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN tutor_bot_conversation_messages.sender_user_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.sender_user_type IS 'not_pii: Role of the message sender (student, bot, or volunteer)';


--
-- Name: COLUMN tutor_bot_conversation_messages.message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.message IS 'not_pii: Message text content';


--
-- Name: COLUMN tutor_bot_conversation_messages.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversation_messages.created_at IS 'not_pii';


--
-- Name: tutor_bot_conversations; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.tutor_bot_conversations (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subject_id integer NOT NULL
);


--
-- Name: TABLE tutor_bot_conversations; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.tutor_bot_conversations IS 'AI tutor bot conversations';


--
-- Name: COLUMN tutor_bot_conversations.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.id IS 'not_pii: Primary key';


--
-- Name: COLUMN tutor_bot_conversations.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN tutor_bot_conversations.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN tutor_bot_conversations.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.created_at IS 'not_pii';


--
-- Name: COLUMN tutor_bot_conversations.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.updated_at IS 'not_pii';


--
-- Name: COLUMN tutor_bot_conversations.subject_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_conversations.subject_id IS 'not_pii: Foreign key to upchieve.subjects';


--
-- Name: tutor_bot_session_messages; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.tutor_bot_session_messages (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    message text,
    tutor_bot_session_user_type upchieve.tutor_bot_session_user_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE tutor_bot_session_messages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.tutor_bot_session_messages IS 'Messages exchanged between a user and the AI tutor bot during a live session';


--
-- Name: COLUMN tutor_bot_session_messages.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.id IS 'not_pii: Primary key';


--
-- Name: COLUMN tutor_bot_session_messages.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN tutor_bot_session_messages.message; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.message IS 'not_pii: Message text content';


--
-- Name: COLUMN tutor_bot_session_messages.tutor_bot_session_user_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.tutor_bot_session_user_type IS 'not_pii: Whether the message was sent by the student or the bot';


--
-- Name: COLUMN tutor_bot_session_messages.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.tutor_bot_session_messages.created_at IS 'not_pii';


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
-- Name: TABLE us_states; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.us_states IS 'Reference table of US states';


--
-- Name: COLUMN us_states.code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.us_states.code IS 'not_pii: Two-letter US state abbreviation (primary key)';


--
-- Name: COLUMN us_states.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.us_states.name IS 'not_pii: Full name of the US state';


--
-- Name: COLUMN us_states.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.us_states.created_at IS 'not_pii';


--
-- Name: COLUMN us_states.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.us_states.updated_at IS 'not_pii';


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
    ban_reason text,
    clientuuid uuid
);


--
-- Name: TABLE user_actions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.user_actions IS 'Audit log of notable events and actions taken by users on the platform';


--
-- Name: COLUMN user_actions.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.id IS 'not_pii: Primary key';


--
-- Name: COLUMN user_actions.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN user_actions.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN user_actions.action_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.action_type IS 'not_pii: Category of the user action (e.g. account, session)';


--
-- Name: COLUMN user_actions.action; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.action IS 'not_pii: Specific action label';


--
-- Name: COLUMN user_actions.ip_address_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';


--
-- Name: COLUMN user_actions.device; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.device IS 'pii: Device type parsed from the user agent string';


--
-- Name: COLUMN user_actions.browser; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.browser IS 'pii: Browser name parsed from the user agent string';


--
-- Name: COLUMN user_actions.browser_version; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.browser_version IS 'pii: Browser version string';


--
-- Name: COLUMN user_actions.operating_system; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.operating_system IS 'pii: Operating system name';


--
-- Name: COLUMN user_actions.operating_system_version; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.operating_system_version IS 'pii: Operating system version string';


--
-- Name: COLUMN user_actions.quiz_subcategory; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.quiz_subcategory IS 'not_pii: Quiz subcategory label captured at time of the action';


--
-- Name: COLUMN user_actions.quiz_category; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.quiz_category IS 'not_pii: Quiz category label captured at time of the action';


--
-- Name: COLUMN user_actions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.created_at IS 'not_pii';


--
-- Name: COLUMN user_actions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.updated_at IS 'not_pii';


--
-- Name: COLUMN user_actions.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN user_actions.reference_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.reference_email IS 'pii: Email address of the volunteer reference at time of the action';


--
-- Name: COLUMN user_actions.volunteer_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.volunteer_id IS 'not_pii: Foreign key to upchieve.users (the volunteer)';


--
-- Name: COLUMN user_actions.ban_reason; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.ban_reason IS 'not_pii: Reason text recorded when a ban action was taken';


--
-- Name: COLUMN user_actions.clientuuid; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_actions.clientuuid IS 'not_pii: Client-generated UUID for deduplicating action events';


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
    fall_incentive_program boolean DEFAULT false NOT NULL,
    paid_tutors_pilot_group upchieve.paid_tutors_pilot_groups,
    fall_incentive_enrollment_at timestamp with time zone,
    impact_study_enrollment_at timestamp with time zone,
    impact_study_campaigns jsonb DEFAULT '{}'::jsonb
);


--
-- Name: TABLE user_product_flags; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.user_product_flags IS 'Per-user feature flags, experiment enrollments, and onboarding email send status';


--
-- Name: COLUMN user_product_flags.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN user_product_flags.sent_ready_to_coach_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.sent_ready_to_coach_email IS 'not_pii: Whether the ready-to-coach onboarding email has been sent';


--
-- Name: COLUMN user_product_flags.sent_hour_summary_intro_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.sent_hour_summary_intro_email IS 'not_pii: Whether the hour summary intro email has been sent';


--
-- Name: COLUMN user_product_flags.sent_inactive_thirty_day_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_thirty_day_email IS 'not_pii: Whether the 30-day inactivity re-engagement email has been sent';


--
-- Name: COLUMN user_product_flags.sent_inactive_sixty_day_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_sixty_day_email IS 'not_pii: Whether the 60-day inactivity re-engagement email has been sent';


--
-- Name: COLUMN user_product_flags.sent_inactive_ninety_day_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.sent_inactive_ninety_day_email IS 'not_pii: Whether the 90-day inactivity re-engagement email has been sent';


--
-- Name: COLUMN user_product_flags.gates_qualified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.gates_qualified IS 'not_pii: Whether the user qualifies for the Gates Foundation study';


--
-- Name: COLUMN user_product_flags.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.created_at IS 'not_pii';


--
-- Name: COLUMN user_product_flags.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.updated_at IS 'not_pii';


--
-- Name: COLUMN user_product_flags.in_gates_study; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.in_gates_study IS 'not_pii: Whether the user is enrolled in the Gates Foundation study';


--
-- Name: COLUMN user_product_flags.fall_incentive_program; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.fall_incentive_program IS 'not_pii: Whether the user is enrolled in the fall incentive program';


--
-- Name: COLUMN user_product_flags.paid_tutors_pilot_group; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.paid_tutors_pilot_group IS 'not_pii: Whether the user is in the paid tutors pilot';


--
-- Name: COLUMN user_product_flags.fall_incentive_enrollment_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.fall_incentive_enrollment_at IS 'not_pii: Timestamp when the user enrolled in the fall incentive program';


--
-- Name: COLUMN user_product_flags.impact_study_enrollment_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.impact_study_enrollment_at IS 'not_pii: Timestamp when the user enrolled in the impact study';


--
-- Name: COLUMN user_product_flags.impact_study_campaigns; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_product_flags.impact_study_campaigns IS 'not_pii: JSON map of impact study campaign assignments for the user';


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
-- Name: TABLE user_roles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.user_roles IS 'Reference table of user roles';


--
-- Name: COLUMN user_roles.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_roles.id IS 'not_pii: Primary key';


--
-- Name: COLUMN user_roles.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_roles.name IS 'not_pii: Human-readable name';


--
-- Name: COLUMN user_roles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_roles.created_at IS 'not_pii';


--
-- Name: COLUMN user_roles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_roles.updated_at IS 'not_pii';


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
-- Name: TABLE user_session_metrics; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.user_session_metrics IS 'Aggregated counts of session-level behavioral flags per user';


--
-- Name: COLUMN user_session_metrics.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN user_session_metrics.absent_student; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.absent_student IS 'not_pii: Count of sessions where the student was flagged as absent';


--
-- Name: COLUMN user_session_metrics.absent_volunteer; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.absent_volunteer IS 'not_pii: Count of sessions where the volunteer was flagged as absent';


--
-- Name: COLUMN user_session_metrics.low_session_rating_from_coach; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.low_session_rating_from_coach IS 'not_pii: Count of low session ratings submitted by the volunteer';


--
-- Name: COLUMN user_session_metrics.low_session_rating_from_student; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.low_session_rating_from_student IS 'not_pii: Count of low session ratings submitted by the student';


--
-- Name: COLUMN user_session_metrics.low_coach_rating_from_student; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.low_coach_rating_from_student IS 'not_pii: Count of low coach ratings submitted by the student';


--
-- Name: COLUMN user_session_metrics.reported; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.reported IS 'not_pii: Count of times the user has been reported';


--
-- Name: COLUMN user_session_metrics.only_looking_for_answers; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.only_looking_for_answers IS 'not_pii: Count of pressuring-coach session flags';


--
-- Name: COLUMN user_session_metrics.rude_or_inappropriate; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.rude_or_inappropriate IS 'not_pii: Count of mean-or-inappropriate session flags';


--
-- Name: COLUMN user_session_metrics.comment_from_student; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.comment_from_student IS 'not_pii: Count of comment-from-student session flags';


--
-- Name: COLUMN user_session_metrics.comment_from_volunteer; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.comment_from_volunteer IS 'not_pii: Count of comment-from-volunteer session flags';


--
-- Name: COLUMN user_session_metrics.has_been_unmatched; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.has_been_unmatched IS 'not_pii: Count of has-been-unmatched session flags';


--
-- Name: COLUMN user_session_metrics.has_had_technical_issues; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.has_had_technical_issues IS 'not_pii: Count of technical-issues session flags';


--
-- Name: COLUMN user_session_metrics.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.created_at IS 'not_pii';


--
-- Name: COLUMN user_session_metrics.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.updated_at IS 'not_pii';


--
-- Name: COLUMN user_session_metrics.personal_identifying_info; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.personal_identifying_info IS 'pii: Count of PII session flags';


--
-- Name: COLUMN user_session_metrics.coach_uncomfortable; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.coach_uncomfortable IS 'pii: Count of coach-uncomfortable session flags';


--
-- Name: COLUMN user_session_metrics.student_crisis; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.user_session_metrics.student_crisis IS 'pii: Count of student-in-distress session flags';


--
-- Name: user_session_metrics_view; Type: VIEW; Schema: upchieve; Owner: -
--

CREATE VIEW upchieve.user_session_metrics_view AS
 WITH flags_with_users AS (
         SELECT sessions_session_flags.session_id,
            session_flags.name AS flag_name,
            sessions.student_id,
            sessions.volunteer_id,
            sessions_session_flags.created_at
           FROM ((upchieve.sessions_session_flags
             JOIN upchieve.session_flags ON ((sessions_session_flags.session_flag_id = session_flags.id)))
             JOIN upchieve.sessions ON ((sessions.id = sessions_session_flags.session_id)))
        ), flag_rows_by_user AS (
         SELECT flags_with_users.student_id AS user_id,
            'student'::text AS user_role,
            flags_with_users.flag_name,
            flags_with_users.created_at
           FROM flags_with_users
          WHERE (flags_with_users.student_id IS NOT NULL)
        UNION ALL
         SELECT flags_with_users.volunteer_id AS user_id,
            'volunteer'::text AS user_role,
            flags_with_users.flag_name,
            flags_with_users.created_at
           FROM flags_with_users
          WHERE (flags_with_users.volunteer_id IS NOT NULL)
        )
 SELECT flag_rows_by_user.user_id,
    flag_rows_by_user.user_role,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Absent student'::text)) AS absent_student,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Absent volunteer'::text)) AS absent_volunteer,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Low session rating from coach'::text)) AS low_session_rating_from_coach,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Low session rating from student'::text)) AS low_session_rating_from_student,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Low coach rating from student'::text)) AS low_coach_rating_from_student,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Reported'::text)) AS reported,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Pressuring coach'::text)) AS only_looking_for_answers,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Mean or inappropriate'::text)) AS rude_or_inappropriate,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Comment from student'::text)) AS comment_from_student,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Comment from volunteer'::text)) AS comment_from_volunteer,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Has been unmatched'::text)) AS has_been_unmatched,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Has had technical issues'::text)) AS has_had_technical_issues,
    count(*) FILTER (WHERE ((flag_rows_by_user.flag_name = 'Personally identifiable information'::text) OR (flag_rows_by_user.flag_name = 'PII'::text))) AS personal_identifying_info,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Graded assignment'::text)) AS graded_assignment,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Coach uncomfortable'::text)) AS coach_uncomfortable,
    count(*) FILTER (WHERE (flag_rows_by_user.flag_name = 'Student in distress'::text)) AS student_crisis,
    min(flag_rows_by_user.created_at) AS created_at
   FROM flag_rows_by_user
  GROUP BY flag_rows_by_user.user_id, flag_rows_by_user.user_role;


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
    proxy_email text,
    ban_type upchieve.ban_types,
    preferred_language_code text,
    preferred_language text,
    deleted boolean DEFAULT false,
    CONSTRAINT users_email_proxy_email_differ CHECK ((lower(email) <> lower(proxy_email)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users IS 'All user accounts on the platform';


--
-- Name: COLUMN users.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.id IS 'not_pii: Primary key';


--
-- Name: COLUMN users.verified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.verified IS 'not_pii: Whether one of the user notification methods has been verified';


--
-- Name: COLUMN users.email_verified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.email_verified IS 'not_pii: Whether the user has verified their email address';


--
-- Name: COLUMN users.phone_verified; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.phone_verified IS 'not_pii: Whether the user has verified their phone number';


--
-- Name: COLUMN users.email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.email IS 'pii: User email address';


--
-- Name: COLUMN users.password; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.password IS 'pii: Hashed password';


--
-- Name: COLUMN users.password_reset_token; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.password_reset_token IS 'pii: Token used to reset the user password';


--
-- Name: COLUMN users.first_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.first_name IS 'pii: First name';


--
-- Name: COLUMN users.last_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.last_name IS 'pii: Last name';


--
-- Name: COLUMN users.deactivated; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.deactivated IS 'not_pii: Whether the user account has been deactivated';


--
-- Name: COLUMN users.last_activity_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.last_activity_at IS 'not_pii: Timestamp of the most recent user activity';


--
-- Name: COLUMN users.referral_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.referral_code IS 'not_pii: Unique code used to refer new users';


--
-- Name: COLUMN users.test_user; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.test_user IS 'not_pii: Whether the account is a test or internal account';


--
-- Name: COLUMN users.banned; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.banned IS 'not_pii: Whether the user has been banned';


--
-- Name: COLUMN users.ban_reason_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.ban_reason_id IS 'not_pii: Foreign key to upchieve.ban_reasons';


--
-- Name: COLUMN users.time_tutored; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.time_tutored IS 'not_pii: Duration of active tutoring in milliseconds';


--
-- Name: COLUMN users.signup_source_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.signup_source_id IS 'not_pii: Foreign key to upchieve.signup_sources';


--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.created_at IS 'not_pii';


--
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.updated_at IS 'not_pii';


--
-- Name: COLUMN users.phone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.phone IS 'pii: Phone number';


--
-- Name: COLUMN users.sms_consent; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.sms_consent IS 'not_pii: Whether the user has consented to receive SMS messages';


--
-- Name: COLUMN users.mongo_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.mongo_id IS 'not_pii: @deprecated - legacy MongoDB ObjectId from the pre-Postgres migration';


--
-- Name: COLUMN users.other_signup_source; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.other_signup_source IS 'not_pii: Free-text signup source when not in the standard list';


--
-- Name: COLUMN users.proxy_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.proxy_email IS 'pii: Alternate email';


--
-- Name: COLUMN users.ban_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.ban_type IS 'not_pii: Type of ban (shadow, complete, live_media)';


--
-- Name: COLUMN users.preferred_language_code; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.preferred_language_code IS 'not_pii: IETF language tag for the user preferred language';


--
-- Name: COLUMN users.preferred_language; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.preferred_language IS 'not_pii: Display name of the user preferred language';


--
-- Name: COLUMN users.deleted; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users.deleted IS 'not_pii: Soft-delete flag';


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
-- Name: TABLE users_certifications; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_certifications IS 'Join table tracking which certifications each volunteer has earned';


--
-- Name: COLUMN users_certifications.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_certifications.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_certifications.certification_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_certifications.certification_id IS 'not_pii: Foreign key to upchieve.certifications';


--
-- Name: COLUMN users_certifications.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_certifications.created_at IS 'not_pii';


--
-- Name: COLUMN users_certifications.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_certifications.updated_at IS 'not_pii';


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
-- Name: TABLE users_ip_addresses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_ip_addresses IS 'Join table associating users with IP addresses they have used';


--
-- Name: COLUMN users_ip_addresses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_ip_addresses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN users_ip_addresses.ip_address_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_ip_addresses.ip_address_id IS 'pii: Foreign key to upchieve.ip_addresses';


--
-- Name: COLUMN users_ip_addresses.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_ip_addresses.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_ip_addresses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_ip_addresses.created_at IS 'not_pii';


--
-- Name: COLUMN users_ip_addresses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_ip_addresses.updated_at IS 'not_pii';


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
-- Name: TABLE users_quizzes; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_quizzes IS 'Join table tracking volunteer quiz attempts and pass/fail status';


--
-- Name: COLUMN users_quizzes.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_quizzes.quiz_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.quiz_id IS 'not_pii: Foreign key to upchieve.quizzes';


--
-- Name: COLUMN users_quizzes.attempts; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.attempts IS 'not_pii: Number of quiz attempts by the user';


--
-- Name: COLUMN users_quizzes.passed; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.passed IS 'not_pii: Whether the user has passed the quiz';


--
-- Name: COLUMN users_quizzes.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.created_at IS 'not_pii';


--
-- Name: COLUMN users_quizzes.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_quizzes.updated_at IS 'not_pii';


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
-- Name: TABLE users_roles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_roles IS 'Join table assigning roles to users';


--
-- Name: COLUMN users_roles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_roles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_roles.role_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_roles.role_id IS 'not_pii: Foreign key to a roles lookup table';


--
-- Name: COLUMN users_roles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_roles.created_at IS 'not_pii';


--
-- Name: COLUMN users_roles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_roles.updated_at IS 'not_pii';


--
-- Name: users_schools; Type: TABLE; Schema: upchieve; Owner: -
--

CREATE TABLE upchieve.users_schools (
    user_id uuid NOT NULL,
    school_id uuid NOT NULL,
    association_type upchieve.user_school_association_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE users_schools; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_schools IS 'Join table associating users with schools';


--
-- Name: COLUMN users_schools.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_schools.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_schools.school_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_schools.school_id IS 'not_pii: Foreign key to upchieve.schools';


--
-- Name: COLUMN users_schools.association_type; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_schools.association_type IS 'not_pii: Type of user-school association (student_at_school or teacher_at_school)';


--
-- Name: COLUMN users_schools.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_schools.created_at IS 'not_pii';


--
-- Name: COLUMN users_schools.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_schools.updated_at IS 'not_pii';


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
-- Name: TABLE users_student_partner_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_student_partner_orgs_instances IS 'Represents active/deactivated status of a student''s affiliationi with a student partner org';


--
-- Name: COLUMN users_student_partner_orgs_instances.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_student_partner_orgs_instances.student_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_id IS 'not_pii: Foreign key to upchieve.student_partner_orgs';


--
-- Name: COLUMN users_student_partner_orgs_instances.student_partner_org_site_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_site_id IS 'not_pii: Foreign key to upchieve.student_partner_org_sites';


--
-- Name: COLUMN users_student_partner_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN users_student_partner_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN users_student_partner_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.updated_at IS 'not_pii';


--
-- Name: COLUMN users_student_partner_orgs_instances.student_partner_org_user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.student_partner_org_user_id IS 'not_pii: @deprecated';


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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    progress_report_id uuid
);


--
-- Name: TABLE users_surveys; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_surveys IS 'Surveys that have been completed by a user';


--
-- Name: COLUMN users_surveys.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.id IS 'not_pii: Primary key';


--
-- Name: COLUMN users_surveys.survey_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.survey_id IS 'not_pii: Foreign key to upchieve.surveys';


--
-- Name: COLUMN users_surveys.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_surveys.session_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.session_id IS 'not_pii: Foreign key to upchieve.sessions';


--
-- Name: COLUMN users_surveys.survey_type_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.survey_type_id IS 'not_pii: Foreign key to upchieve.survey_types';


--
-- Name: COLUMN users_surveys.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.created_at IS 'not_pii';


--
-- Name: COLUMN users_surveys.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.updated_at IS 'not_pii';


--
-- Name: COLUMN users_surveys.progress_report_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys.progress_report_id IS 'not_pii: Foreign key to upchieve.progress_reports';


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
-- Name: TABLE users_surveys_submissions; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_surveys_submissions IS 'Individual response submissions for a user''s survey';


--
-- Name: COLUMN users_surveys_submissions.user_survey_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.user_survey_id IS 'not_pii: Foreign key to upchieve.users_surveys';


--
-- Name: COLUMN users_surveys_submissions.survey_question_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.survey_question_id IS 'not_pii: Foreign key to upchieve.survey_questions';


--
-- Name: COLUMN users_surveys_submissions.survey_response_choice_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.survey_response_choice_id IS 'not_pii: Foreign key to upchieve.survey_response_choices';


--
-- Name: COLUMN users_surveys_submissions.open_response; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.open_response IS 'not_pii: Free-text response to an open-ended survey question';


--
-- Name: COLUMN users_surveys_submissions.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.created_at IS 'not_pii';


--
-- Name: COLUMN users_surveys_submissions.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_surveys_submissions.updated_at IS 'not_pii';


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
-- Name: TABLE users_training_courses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_training_courses IS 'Join table tracking each volunteer''s progress through training courses';


--
-- Name: COLUMN users_training_courses.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_training_courses.training_course_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.training_course_id IS 'not_pii: Foreign key to upchieve.training_courses';


--
-- Name: COLUMN users_training_courses.complete; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.complete IS 'not_pii: Whether the training course has been completed';


--
-- Name: COLUMN users_training_courses.progress; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.progress IS 'not_pii: Completion percentage of the training course (0-100)';


--
-- Name: COLUMN users_training_courses.completed_materials; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.completed_materials IS 'not_pii: Array of completed training material identifiers';


--
-- Name: COLUMN users_training_courses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.created_at IS 'not_pii';


--
-- Name: COLUMN users_training_courses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_training_courses.updated_at IS 'not_pii';


--
-- Name: users_unlocked_subjects_view; Type: VIEW; Schema: upchieve; Owner: -
--

CREATE VIEW upchieve.users_unlocked_subjects_view AS
 WITH certifications_by_user AS (
         SELECT users_certifications.user_id,
            array_agg(DISTINCT users_certifications.certification_id) AS certification_ids
           FROM upchieve.users_certifications
          GROUP BY users_certifications.user_id
        ), direct_subject_unlocks AS (
         SELECT uc.user_id,
            csu.subject_id
           FROM (upchieve.users_certifications uc
             JOIN upchieve.certification_subject_unlocks csu ON ((csu.certification_id = uc.certification_id)))
        ), computed_unlocks AS (
         SELECT cbu.user_id,
            comp_su.subject_id
           FROM (certifications_by_user cbu
             JOIN ( SELECT csu.subject_id,
                    array_agg(DISTINCT csu.certification_id) AS required_certs
                   FROM upchieve.computed_subject_unlocks csu
                  GROUP BY csu.subject_id) comp_su ON ((cbu.certification_ids @> comp_su.required_certs)))
        )
 SELECT all_unlocks.user_id,
    array_agg(DISTINCT s.name) AS unlocked_subjects
   FROM (( SELECT direct_subject_unlocks.user_id,
            direct_subject_unlocks.subject_id
           FROM direct_subject_unlocks
        UNION ALL
         SELECT computed_unlocks.user_id,
            computed_unlocks.subject_id
           FROM computed_unlocks) all_unlocks
     JOIN upchieve.subjects s ON ((s.id = all_unlocks.subject_id)))
  GROUP BY all_unlocks.user_id;


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
-- Name: TABLE users_volunteer_partner_orgs_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.users_volunteer_partner_orgs_instances IS 'Represents active/deactivated status of a volunteer''s affiliation with a volunteer partner org';


--
-- Name: COLUMN users_volunteer_partner_orgs_instances.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN users_volunteer_partner_orgs_instances.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN users_volunteer_partner_orgs_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.deactivated_on IS 'not_pii: Date when the association was deactivated';


--
-- Name: COLUMN users_volunteer_partner_orgs_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.created_at IS 'not_pii';


--
-- Name: COLUMN users_volunteer_partner_orgs_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.updated_at IS 'not_pii';


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
-- Name: TABLE volunteer_occupations; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_occupations IS 'Job titles or occupations reported by volunteers during onboarding';


--
-- Name: COLUMN volunteer_occupations.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_occupations.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN volunteer_occupations.occupation; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_occupations.occupation IS 'pii: Volunteer job title or occupation';


--
-- Name: COLUMN volunteer_occupations.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_occupations.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_occupations.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_occupations.updated_at IS 'not_pii';


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
-- Name: TABLE volunteer_partner_orgs; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_partner_orgs IS 'Organizations whose employees volunteer on the platform';


--
-- Name: COLUMN volunteer_partner_orgs.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.id IS 'not_pii: Primary key';


--
-- Name: COLUMN volunteer_partner_orgs.key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.key IS 'not_pii: Unique URL-safe slug';


--
-- Name: COLUMN volunteer_partner_orgs.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.name IS 'not_pii: Human-readable name of the volunteer partner organization';


--
-- Name: COLUMN volunteer_partner_orgs.receive_weekly_hour_summary_email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.receive_weekly_hour_summary_email IS 'not_pii: Whether the org receives weekly volunteer hour summary emails';


--
-- Name: COLUMN volunteer_partner_orgs.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_partner_orgs.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs.updated_at IS 'not_pii';


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
-- Name: TABLE volunteer_partner_orgs_upchieve_instances; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_partner_orgs_upchieve_instances IS 'Represents active/deactivated status a volunteer partner org''s partnership';


--
-- Name: COLUMN volunteer_partner_orgs_upchieve_instances.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.id IS 'not_pii: Primary key';


--
-- Name: COLUMN volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN volunteer_partner_orgs_upchieve_instances.deactivated_on; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.deactivated_on IS 'not_pii: Date when the volunteer org was no longer part of the volunteer partner organization';


--
-- Name: COLUMN volunteer_partner_orgs_upchieve_instances.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_partner_orgs_upchieve_instances.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_partner_orgs_upchieve_instances.updated_at IS 'not_pii';


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
-- Name: TABLE volunteer_profiles; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_profiles IS 'Profile data about volunteer users';


--
-- Name: COLUMN volunteer_profiles.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN volunteer_profiles.volunteer_partner_org_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.volunteer_partner_org_id IS 'not_pii: Foreign key to upchieve.volunteer_partner_orgs';


--
-- Name: COLUMN volunteer_profiles.timezone; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.timezone IS 'pii: IANA timezone identifier';


--
-- Name: COLUMN volunteer_profiles.approved; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.approved IS 'not_pii: Whether the volunteer application has been approved';


--
-- Name: COLUMN volunteer_profiles.onboarded; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.onboarded IS 'not_pii: Whether the volunteer has completed all onboarding steps';


--
-- Name: COLUMN volunteer_profiles.photo_id_s3_key; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.photo_id_s3_key IS 'pii: S3 object key for the volunteer photo ID upload';


--
-- Name: COLUMN volunteer_profiles.photo_id_status; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.photo_id_status IS 'not_pii: Foreign key to upchieve.photo_id_statuses';


--
-- Name: COLUMN volunteer_profiles.linkedin_url; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.linkedin_url IS 'pii: Volunteer LinkedIn profile URL';


--
-- Name: COLUMN volunteer_profiles.college; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.college IS 'pii: College or university name';


--
-- Name: COLUMN volunteer_profiles.company; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.company IS 'pii: Volunteer employer company name';


--
-- Name: COLUMN volunteer_profiles.languages; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.languages IS 'not_pii: Languages the volunteer speaks';


--
-- Name: COLUMN volunteer_profiles.experience; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.experience IS 'not_pii: JSON blob of volunteer professional experience';


--
-- Name: COLUMN volunteer_profiles.city; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.city IS 'pii: City of residence';


--
-- Name: COLUMN volunteer_profiles.state; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.state IS 'pii: US state abbreviation';


--
-- Name: COLUMN volunteer_profiles.country; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.country IS 'pii: Country of residence';


--
-- Name: COLUMN volunteer_profiles.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_profiles.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.updated_at IS 'not_pii';


--
-- Name: COLUMN volunteer_profiles.total_volunteer_hours; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.total_volunteer_hours IS 'not_pii: Cumulative tutoring hours logged by the volunteer, only calculated for config.customVolunteerPartnerOrgs';


--
-- Name: COLUMN volunteer_profiles.elapsed_availability; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_profiles.elapsed_availability IS 'not_pii: Cumulative hours the volunteer was marked available on their calendar';


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
-- Name: TABLE volunteer_reference_statuses; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_reference_statuses IS 'Reference table for the status of a volunteer''s reference request';


--
-- Name: COLUMN volunteer_reference_statuses.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.id IS 'not_pii: Primary key';


--
-- Name: COLUMN volunteer_reference_statuses.name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.name IS 'not_pii: Human-readable name of the status of the reference';


--
-- Name: COLUMN volunteer_reference_statuses.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_reference_statuses.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_reference_statuses.updated_at IS 'not_pii';


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
-- Name: TABLE volunteer_references; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.volunteer_references IS 'References for volunteers';


--
-- Name: COLUMN volunteer_references.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.id IS 'not_pii: Primary key';


--
-- Name: COLUMN volunteer_references.user_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.user_id IS 'not_pii: Foreign key to upchieve.users';


--
-- Name: COLUMN volunteer_references.first_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.first_name IS 'pii: First name of the reference';


--
-- Name: COLUMN volunteer_references.last_name; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.last_name IS 'pii: Last name of the reference';


--
-- Name: COLUMN volunteer_references.email; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.email IS 'pii: User email address of the reference';


--
-- Name: COLUMN volunteer_references.status_id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.status_id IS 'not_pii: Foreign key to upchieve.volunteer_reference_statuses; the current status of the reference request';


--
-- Name: COLUMN volunteer_references.sent_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.sent_at IS 'not_pii: Timestamp when the reference request was sent';


--
-- Name: COLUMN volunteer_references.affiliation; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.affiliation IS 'pii: Reference contact relationship to the volunteer (e.g. colleague, professor)';


--
-- Name: COLUMN volunteer_references.relationship_length; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.relationship_length IS 'pii: How long the reference has known the volunteer';


--
-- Name: COLUMN volunteer_references.patient; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.patient IS 'not_pii: Reference rating for patience (1-5)';


--
-- Name: COLUMN volunteer_references.positive_role_model; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.positive_role_model IS 'not_pii: Reference rating for being a positive role model (1-5)';


--
-- Name: COLUMN volunteer_references.agreeable_and_approachable; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.agreeable_and_approachable IS 'pii: Reference rating for agreeableness and approachability (1-5)';


--
-- Name: COLUMN volunteer_references.communicates_effectively; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.communicates_effectively IS 'not_pii: Reference rating for communication effectiveness (1-5)';


--
-- Name: COLUMN volunteer_references.rejection_reason; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.rejection_reason IS 'pii: Reason the reference submission was rejected';


--
-- Name: COLUMN volunteer_references.additional_info; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.additional_info IS 'pii: Additional notes provided by the reference';


--
-- Name: COLUMN volunteer_references.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.created_at IS 'not_pii';


--
-- Name: COLUMN volunteer_references.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.updated_at IS 'not_pii';


--
-- Name: COLUMN volunteer_references.trustworthy_with_children; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.volunteer_references.trustworthy_with_children IS 'not_pii: Reference rating for trustworthiness with children (1-5)';


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
-- Name: TABLE weekdays; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON TABLE upchieve.weekdays IS 'Reference table of the days of the week';


--
-- Name: COLUMN weekdays.id; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.weekdays.id IS 'not_pii: Primary key';


--
-- Name: COLUMN weekdays.day; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.weekdays.day IS 'not_pii: Name of the weekday (e.g. Monday)';


--
-- Name: COLUMN weekdays.created_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.weekdays.created_at IS 'not_pii';


--
-- Name: COLUMN weekdays.updated_at; Type: COMMENT; Schema: upchieve; Owner: -
--

COMMENT ON COLUMN upchieve.weekdays.updated_at IS 'not_pii';


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
-- Name: email_domain_blocklist id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.email_domain_blocklist ALTER COLUMN id SET DEFAULT nextval('upchieve.email_domain_blocklist_id_seq'::regclass);


--
-- Name: grade_levels id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.grade_levels ALTER COLUMN id SET DEFAULT nextval('upchieve.grade_levels_id_seq'::regclass);


--
-- Name: ip_addresses id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.ip_addresses ALTER COLUMN id SET DEFAULT nextval('upchieve.ip_addresses_id_seq'::regclass);


--
-- Name: moderation_actions id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_actions ALTER COLUMN id SET DEFAULT nextval('upchieve.moderation_actions_id_seq'::regclass);


--
-- Name: moderation_categories id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_categories ALTER COLUMN id SET DEFAULT nextval('upchieve.moderation_categories_id_seq'::regclass);


--
-- Name: moderation_rules id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rules ALTER COLUMN id SET DEFAULT nextval('upchieve.moderation_rules_id_seq'::regclass);


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
-- Name: progress_report_prompts id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_prompts ALTER COLUMN id SET DEFAULT nextval('upchieve.progress_report_prompts_id_seq'::regclass);


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
-- Name: referrals id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.referrals ALTER COLUMN id SET DEFAULT nextval('upchieve.referrals_id_seq'::regclass);


--
-- Name: report_reasons id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.report_reasons ALTER COLUMN id SET DEFAULT nextval('upchieve.report_reasons_id_seq'::regclass);


--
-- Name: session_flags id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_flags ALTER COLUMN id SET DEFAULT nextval('upchieve.session_flags_id_seq'::regclass);


--
-- Name: shareable_domains id; Type: DEFAULT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.shareable_domains ALTER COLUMN id SET DEFAULT nextval('upchieve.shareable_domains_id_seq'::regclass);


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
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


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
-- Name: censored_session_messages censored_session_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.censored_session_messages
    ADD CONSTRAINT censored_session_messages_pkey PRIMARY KEY (id);


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
-- Name: clever_school_mapping clever_school_mapping_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.clever_school_mapping
    ADD CONSTRAINT clever_school_mapping_pkey PRIMARY KEY (upchieve_school_id, clever_school_id);


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
-- Name: email_domain_blocklist email_domain_blocklist_domain_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.email_domain_blocklist
    ADD CONSTRAINT email_domain_blocklist_domain_key UNIQUE (domain);


--
-- Name: email_domain_blocklist email_domain_blocklist_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.email_domain_blocklist
    ADD CONSTRAINT email_domain_blocklist_pkey PRIMARY KEY (id);


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
-- Name: moderation_actions moderation_actions_action_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_actions
    ADD CONSTRAINT moderation_actions_action_name_key UNIQUE (action_name);


--
-- Name: moderation_actions moderation_actions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_actions
    ADD CONSTRAINT moderation_actions_pkey PRIMARY KEY (id);


--
-- Name: moderation_categories moderation_categories_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_categories
    ADD CONSTRAINT moderation_categories_pkey PRIMARY KEY (id);


--
-- Name: moderation_infractions moderation_infractions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_infractions
    ADD CONSTRAINT moderation_infractions_pkey PRIMARY KEY (id);


--
-- Name: moderation_penalty_config moderation_penalty_config_moderation_type_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_penalty_config
    ADD CONSTRAINT moderation_penalty_config_moderation_type_key UNIQUE (moderation_type);


--
-- Name: moderation_penalty_config moderation_penalty_config_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_penalty_config
    ADD CONSTRAINT moderation_penalty_config_pkey PRIMARY KEY (id);


--
-- Name: moderation_rules moderation_rules_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rules
    ADD CONSTRAINT moderation_rules_name_key UNIQUE (name);


--
-- Name: moderation_rules moderation_rules_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rules
    ADD CONSTRAINT moderation_rules_pkey PRIMARY KEY (id);


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
-- Name: nths_actions nths_actions_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_actions
    ADD CONSTRAINT nths_actions_name_key UNIQUE (name);


--
-- Name: nths_actions nths_actions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_actions
    ADD CONSTRAINT nths_actions_pkey PRIMARY KEY (id);


--
-- Name: nths_advisors nths_advisors_email_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_advisors
    ADD CONSTRAINT nths_advisors_email_key UNIQUE (email);


--
-- Name: nths_advisors nths_advisors_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_advisors
    ADD CONSTRAINT nths_advisors_pkey PRIMARY KEY (id);


--
-- Name: nths_candidate_applications nths_candidate_applications_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_candidate_applications
    ADD CONSTRAINT nths_candidate_applications_pkey PRIMARY KEY (id);


--
-- Name: nths_chapter_statuses nths_chapter_statuses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_chapter_statuses
    ADD CONSTRAINT nths_chapter_statuses_name_key UNIQUE (name);


--
-- Name: nths_chapter_statuses nths_chapter_statuses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_chapter_statuses
    ADD CONSTRAINT nths_chapter_statuses_pkey PRIMARY KEY (id);


--
-- Name: nths_chapters_statuses nths_chapters_statuses_pk; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_chapters_statuses
    ADD CONSTRAINT nths_chapters_statuses_pk PRIMARY KEY (nths_group_id, nths_chapter_status_id, created_at);


--
-- Name: nths_group_actions nths_group_actions_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_actions
    ADD CONSTRAINT nths_group_actions_pkey PRIMARY KEY (id);


--
-- Name: nths_group_member_roles nths_group_member_roles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_member_roles
    ADD CONSTRAINT nths_group_member_roles_pkey PRIMARY KEY (user_id, nths_group_id);


--
-- Name: nths_group_members nths_group_members_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_members
    ADD CONSTRAINT nths_group_members_pkey PRIMARY KEY (nths_group_id, user_id);


--
-- Name: nths_group_roles nths_group_roles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_roles
    ADD CONSTRAINT nths_group_roles_pkey PRIMARY KEY (id);


--
-- Name: nths_group_school_affiliation nths_group_school_affiliation_nths_group_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_nths_group_id_key UNIQUE (nths_group_id);


--
-- Name: nths_groups nths_groups_invite_code_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_groups
    ADD CONSTRAINT nths_groups_invite_code_key UNIQUE (invite_code);


--
-- Name: nths_groups nths_groups_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_groups
    ADD CONSTRAINT nths_groups_pkey PRIMARY KEY (id);


--
-- Name: nths_school_affiliation_statuses nths_school_affiliation_statuses_name_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_school_affiliation_statuses
    ADD CONSTRAINT nths_school_affiliation_statuses_name_key UNIQUE (name);


--
-- Name: nths_school_affiliation_statuses nths_school_affiliation_statuses_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_school_affiliation_statuses
    ADD CONSTRAINT nths_school_affiliation_statuses_pkey PRIMARY KEY (id);


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
-- Name: progress_report_prompts progress_report_prompts_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_prompts
    ADD CONSTRAINT progress_report_prompts_pkey PRIMARY KEY (id);


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
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_user_id_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.referrals
    ADD CONSTRAINT referrals_user_id_key UNIQUE (user_id);


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
-- Name: session_audio session_audio_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_audio
    ADD CONSTRAINT session_audio_pkey PRIMARY KEY (id);


--
-- Name: session_audio_transcript_messages session_audio_transcript_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_audio_transcript_messages
    ADD CONSTRAINT session_audio_transcript_messages_pkey PRIMARY KEY (id);


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
-- Name: session_last_seen session_last_seen_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_last_seen
    ADD CONSTRAINT session_last_seen_pkey PRIMARY KEY (session_id, user_id);


--
-- Name: session_meetings session_meetings_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_meetings
    ADD CONSTRAINT session_meetings_pkey PRIMARY KEY (id);


--
-- Name: session_meetings session_meetings_unique; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_meetings
    ADD CONSTRAINT session_meetings_unique UNIQUE (session_id, provider);


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
-- Name: session_summaries session_summaries_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_summaries
    ADD CONSTRAINT session_summaries_pkey PRIMARY KEY (id);


--
-- Name: session_voice_messages session_voice_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_voice_messages
    ADD CONSTRAINT session_voice_messages_pkey PRIMARY KEY (id);


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
-- Name: sessions_students_assignments sessions_students_assignments_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions_students_assignments
    ADD CONSTRAINT sessions_students_assignments_pkey PRIMARY KEY (session_id, user_id, assignment_id);


--
-- Name: shareable_domains shareable_domains_domain_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.shareable_domains
    ADD CONSTRAINT shareable_domains_domain_key UNIQUE (domain);


--
-- Name: shareable_domains shareable_domains_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.shareable_domains
    ADD CONSTRAINT shareable_domains_pkey PRIMARY KEY (id);


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
-- Name: student_classes student_classes_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_classes
    ADD CONSTRAINT student_classes_pkey PRIMARY KEY (user_id, class_id);


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
-- Name: students_assignments students_assignments_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.students_assignments
    ADD CONSTRAINT students_assignments_pkey PRIMARY KEY (user_id, assignment_id);


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
-- Name: teacher_classes teacher_classes_code_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_classes
    ADD CONSTRAINT teacher_classes_code_key UNIQUE (code);


--
-- Name: teacher_classes teacher_classes_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_classes
    ADD CONSTRAINT teacher_classes_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_profiles
    ADD CONSTRAINT teacher_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: text_moderation_patterns text_moderation_patterns_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.text_moderation_patterns
    ADD CONSTRAINT text_moderation_patterns_pkey PRIMARY KEY (id);


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
-- Name: totp totp_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.totp
    ADD CONSTRAINT totp_pkey PRIMARY KEY (user_id);


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
-- Name: tutor_bot_conversation_messages tutor_bot_conversation_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversation_messages
    ADD CONSTRAINT tutor_bot_conversation_messages_pkey PRIMARY KEY (tutor_bot_conversation_id, user_id, sender_user_type, created_at);


--
-- Name: tutor_bot_conversations tutor_bot_conversations_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversations
    ADD CONSTRAINT tutor_bot_conversations_pkey PRIMARY KEY (id);


--
-- Name: tutor_bot_session_messages tutor_bot_session_messages_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_session_messages
    ADD CONSTRAINT tutor_bot_session_messages_pkey PRIMARY KEY (id);


--
-- Name: cities unique_city_name_state; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.cities
    ADD CONSTRAINT unique_city_name_state UNIQUE (name, us_state_code);


--
-- Name: nths_groups unique_key; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_groups
    ADD CONSTRAINT unique_key UNIQUE (key);


--
-- Name: nths_groups unique_name; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_groups
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: nths_group_school_affiliation unique_school_id; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_school_affiliation
    ADD CONSTRAINT unique_school_id UNIQUE (school_id);


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
-- Name: users_grade_levels users_grade_levels_pkey; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_grade_levels
    ADD CONSTRAINT users_grade_levels_pkey PRIMARY KEY (user_id);


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
-- Name: users_schools users_schools_unique_user_id; Type: CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_schools
    ADD CONSTRAINT users_schools_unique_user_id UNIQUE (user_id);


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
-- Name: IDX_email_domain_blocklist_domain; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX "IDX_email_domain_blocklist_domain" ON upchieve.email_domain_blocklist USING btree (domain);


--
-- Name: avail_user_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX avail_user_id_idx ON upchieve.availabilities USING btree (user_id);


--
-- Name: availabilities_weekday_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX availabilities_weekday_id_idx ON upchieve.availabilities USING btree (weekday_id);


--
-- Name: availability_histories_user_id_recorded_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX availability_histories_user_id_recorded_at ON upchieve.availability_histories USING btree (user_id, recorded_at);


--
-- Name: censored_messages_sent_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX censored_messages_sent_at ON upchieve.censored_session_messages USING btree (sent_at);


--
-- Name: censored_messages_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX censored_messages_session_id ON upchieve.censored_session_messages USING btree (session_id);


--
-- Name: fed_creds_user_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX fed_creds_user_id_idx ON upchieve.federated_credentials USING btree (user_id);


--
-- Name: feedbacks_session_id_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX feedbacks_session_id_user_id ON upchieve.feedbacks USING btree (session_id, user_id);


--
-- Name: legacy_availability_histories_user_id_recorded_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX legacy_availability_histories_user_id_recorded_at ON upchieve.legacy_availability_histories USING btree (user_id, recorded_at);


--
-- Name: moderation_infractions_user_id_session_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX moderation_infractions_user_id_session_id_idx ON upchieve.moderation_infractions USING btree (user_id, session_id);


--
-- Name: notifications_sent_at_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX notifications_sent_at_idx ON upchieve.notifications USING btree (sent_at);


--
-- Name: notifications_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX notifications_session_id ON upchieve.notifications USING btree (session_id);


--
-- Name: notifications_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX notifications_user_id ON upchieve.notifications USING btree (user_id);


--
-- Name: nths_candidate_app_created_at_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_candidate_app_created_at_idx ON upchieve.nths_candidate_applications USING btree (user_id, created_at DESC);


--
-- Name: nths_chapters_statuses_created_at_index; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_chapters_statuses_created_at_index ON upchieve.nths_chapter_statuses USING btree (created_at);


--
-- Name: nths_chapters_statuses_group_createdat_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_chapters_statuses_group_createdat_idx ON upchieve.nths_chapters_statuses USING btree (nths_group_id, created_at DESC);


--
-- Name: nths_chapters_statuses_group_id_index; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_chapters_statuses_group_id_index ON upchieve.nths_chapters_statuses USING btree (nths_group_id);


--
-- Name: nths_group_actions_action_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_group_actions_action_id ON upchieve.nths_group_actions USING btree (nths_action_id);


--
-- Name: nths_group_actions_group_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_group_actions_group_id ON upchieve.nths_group_actions USING btree (nths_group_id);


--
-- Name: nths_group_advisors_group_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX nths_group_advisors_group_id ON upchieve.nths_advisors USING btree (nths_group_id);


--
-- Name: nths_groups_invite_code_index; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX nths_groups_invite_code_index ON upchieve.nths_groups USING btree (invite_code);


--
-- Name: partial_session_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX partial_session_id_idx ON upchieve.user_actions USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: progress_report_concept_details_concept_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_concept_details_concept_id ON upchieve.progress_report_concept_details USING btree (progress_report_concept_id);


--
-- Name: progress_report_concepts_progress_report_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_concepts_progress_report_id ON upchieve.progress_report_concepts USING btree (progress_report_id);


--
-- Name: progress_report_prompt_subject_id_active; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX progress_report_prompt_subject_id_active ON upchieve.progress_report_prompts USING btree (subject_id, active);


--
-- Name: progress_report_prompt_unique_active_subject_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX progress_report_prompt_unique_active_subject_id ON upchieve.progress_report_prompts USING btree (subject_id) WHERE active;


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
-- Name: session_audio_session_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX session_audio_session_id_idx ON upchieve.session_audio USING btree (session_id);


--
-- Name: session_audio_transcript_messages_session_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_audio_transcript_messages_session_id_idx ON upchieve.session_audio_transcript_messages USING btree (session_id);


--
-- Name: session_audio_transcript_messages_user_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_audio_transcript_messages_user_id_idx ON upchieve.users USING btree (id);


--
-- Name: session_meetings_session_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_meetings_session_id_idx ON upchieve.session_meetings USING btree (session_id);


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
-- Name: session_voice_messages_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX session_voice_messages_session_id ON upchieve.session_voice_messages USING btree (session_id);


--
-- Name: sessions_idx_volunteer_ended_at_created_at; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_idx_volunteer_ended_at_created_at ON upchieve.sessions USING btree (volunteer_id, ended_at, created_at);


--
-- Name: sessions_student_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_student_id ON upchieve.sessions USING btree (student_id);


--
-- Name: sessions_to_review_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_to_review_idx ON upchieve.sessions USING btree (to_review);


--
-- Name: sessions_volunteer_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX sessions_volunteer_id ON upchieve.sessions USING btree (volunteer_id);


--
-- Name: survey_questions_response_choices_response_survey_question; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX survey_questions_response_choices_response_survey_question ON upchieve.survey_questions_response_choices USING btree (response_choice_id, surveys_survey_question_id);


--
-- Name: tutor_bot_conversations_unique_non_null_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX tutor_bot_conversations_unique_non_null_session_id ON upchieve.tutor_bot_conversations USING btree (session_id) WHERE (session_id IS NOT NULL);


--
-- Name: user_actions_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX user_actions_user_id ON upchieve.user_actions USING btree (user_id);


--
-- Name: users_lower_case_email_key; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE UNIQUE INDEX users_lower_case_email_key ON upchieve.users USING btree (lower(email));


--
-- Name: users_schools_school_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX users_schools_school_id ON upchieve.users_schools USING btree (school_id);


--
-- Name: users_schools_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX users_schools_user_id ON upchieve.users_schools USING btree (user_id);


--
-- Name: users_submissions_idx_user_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX users_submissions_idx_user_id ON upchieve.users_surveys_submissions USING btree (user_survey_id);


--
-- Name: users_surveys_idx_session_id; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX users_surveys_idx_session_id ON upchieve.users_surveys USING btree (session_id);


--
-- Name: uspoi_user_id_idx; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX uspoi_user_id_idx ON upchieve.users_student_partner_orgs_instances USING btree (user_id);


--
-- Name: volunteer_partner_orgs_key; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX volunteer_partner_orgs_key ON upchieve.volunteer_partner_orgs USING btree (key);


--
-- Name: volunteer_references_user_id_index; Type: INDEX; Schema: upchieve; Owner: -
--

CREATE INDEX volunteer_references_user_id_index ON upchieve.volunteer_references USING btree (user_id);


--
-- Name: users_grade_levels trg_freeze_signup_grade_level_id; Type: TRIGGER; Schema: upchieve; Owner: -
--

CREATE TRIGGER trg_freeze_signup_grade_level_id BEFORE UPDATE OF signup_grade_level_id ON upchieve.users_grade_levels FOR EACH ROW EXECUTE FUNCTION upchieve.freeze_signup_grade_level_id();


--
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: assignments assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assignments
    ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES upchieve.teacher_classes(id);


--
-- Name: assignments assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.assignments
    ADD CONSTRAINT assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


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
-- Name: censored_session_messages censored_session_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.censored_session_messages
    ADD CONSTRAINT censored_session_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES upchieve.users(id);


--
-- Name: censored_session_messages censored_session_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.censored_session_messages
    ADD CONSTRAINT censored_session_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


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
-- Name: clever_school_mapping clever_school_mapping_upchieve_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.clever_school_mapping
    ADD CONSTRAINT clever_school_mapping_upchieve_school_id_fkey FOREIGN KEY (upchieve_school_id) REFERENCES upchieve.schools(id);


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
-- Name: moderation_infractions moderation_infractions_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_infractions
    ADD CONSTRAINT moderation_infractions_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: moderation_infractions moderation_infractions_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_infractions
    ADD CONSTRAINT moderation_infractions_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: moderation_rule_actions moderation_rule_actions_action_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rule_actions
    ADD CONSTRAINT moderation_rule_actions_action_id_fkey FOREIGN KEY (action_id) REFERENCES upchieve.moderation_actions(id);


--
-- Name: moderation_rule_actions moderation_rule_actions_rule_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rule_actions
    ADD CONSTRAINT moderation_rule_actions_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES upchieve.moderation_rules(id);


--
-- Name: moderation_rules_flags moderation_rules_flags_flag_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rules_flags
    ADD CONSTRAINT moderation_rules_flags_flag_id_fkey FOREIGN KEY (flag_id) REFERENCES upchieve.session_flags(id);


--
-- Name: moderation_rules_flags moderation_rules_flags_rule_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_rules_flags
    ADD CONSTRAINT moderation_rules_flags_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES upchieve.moderation_rules(id);


--
-- Name: moderation_settings moderation_settings_moderation_category_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.moderation_settings
    ADD CONSTRAINT moderation_settings_moderation_category_id_fkey FOREIGN KEY (moderation_category_id) REFERENCES upchieve.moderation_categories(id);


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
-- Name: nths_advisors nths_advisors_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_advisors
    ADD CONSTRAINT nths_advisors_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_advisors nths_advisors_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_advisors
    ADD CONSTRAINT nths_advisors_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: nths_candidate_applications nths_candidate_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_candidate_applications
    ADD CONSTRAINT nths_candidate_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: nths_chapters_statuses nths_chapters_statuses_nths_chapter_status_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_chapters_statuses
    ADD CONSTRAINT nths_chapters_statuses_nths_chapter_status_id_fkey FOREIGN KEY (nths_chapter_status_id) REFERENCES upchieve.nths_chapter_statuses(id);


--
-- Name: nths_chapters_statuses nths_chapters_statuses_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_chapters_statuses
    ADD CONSTRAINT nths_chapters_statuses_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_group_actions nths_group_actions_nths_action_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_actions
    ADD CONSTRAINT nths_group_actions_nths_action_id_fkey FOREIGN KEY (nths_action_id) REFERENCES upchieve.nths_actions(id);


--
-- Name: nths_group_actions nths_group_actions_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_actions
    ADD CONSTRAINT nths_group_actions_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_group_member_roles nths_group_member_roles_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_member_roles
    ADD CONSTRAINT nths_group_member_roles_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_group_member_roles nths_group_member_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_member_roles
    ADD CONSTRAINT nths_group_member_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES upchieve.nths_group_roles(id);


--
-- Name: nths_group_member_roles nths_group_member_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_member_roles
    ADD CONSTRAINT nths_group_member_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: nths_group_members nths_group_members_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_members
    ADD CONSTRAINT nths_group_members_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_group_members nths_group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_members
    ADD CONSTRAINT nths_group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: nths_group_school_affiliation nths_group_school_affiliation_nths_group_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_nths_group_id_fkey FOREIGN KEY (nths_group_id) REFERENCES upchieve.nths_groups(id);


--
-- Name: nths_group_school_affiliation nths_group_school_affiliation_nths_school_affiliation_stat_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_nths_school_affiliation_stat_fkey FOREIGN KEY (nths_school_affiliation_status_id) REFERENCES upchieve.nths_school_affiliation_statuses(id);


--
-- Name: nths_group_school_affiliation nths_group_school_affiliation_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


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
-- Name: progress_report_prompts progress_report_prompts_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_report_prompts
    ADD CONSTRAINT progress_report_prompts_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


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
-- Name: progress_reports progress_reports_prompt_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.progress_reports
    ADD CONSTRAINT progress_reports_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES upchieve.progress_report_prompts(id);


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
-- Name: referrals referrals_referred_by_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.referrals
    ADD CONSTRAINT referrals_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES upchieve.users(id);


--
-- Name: referrals referrals_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.referrals
    ADD CONSTRAINT referrals_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


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
-- Name: session_audio session_audio_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_audio
    ADD CONSTRAINT session_audio_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_audio_transcript_messages session_audio_transcript_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_audio_transcript_messages
    ADD CONSTRAINT session_audio_transcript_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_audio_transcript_messages session_audio_transcript_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_audio_transcript_messages
    ADD CONSTRAINT session_audio_transcript_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


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
-- Name: session_last_seen session_last_seen_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_last_seen
    ADD CONSTRAINT session_last_seen_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_last_seen session_last_seen_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_last_seen
    ADD CONSTRAINT session_last_seen_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: session_meetings session_meetings_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_meetings
    ADD CONSTRAINT session_meetings_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


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
-- Name: session_summaries session_summaries_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_summaries
    ADD CONSTRAINT session_summaries_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: session_summaries session_summaries_user_type_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_summaries
    ADD CONSTRAINT session_summaries_user_type_id_fkey FOREIGN KEY (user_type_id) REFERENCES upchieve.user_roles(id);


--
-- Name: session_voice_messages session_voice_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_voice_messages
    ADD CONSTRAINT session_voice_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES upchieve.users(id);


--
-- Name: session_voice_messages session_voice_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.session_voice_messages
    ADD CONSTRAINT session_voice_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: sessions sessions_ended_by_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions
    ADD CONSTRAINT sessions_ended_by_user_id_fkey FOREIGN KEY (ended_by_user_id) REFERENCES upchieve.users(id);


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
-- Name: sessions_students_assignments sessions_students_assignments_user_id_assignment_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.sessions_students_assignments
    ADD CONSTRAINT sessions_students_assignments_user_id_assignment_id_fkey FOREIGN KEY (user_id, assignment_id) REFERENCES upchieve.students_assignments(user_id, assignment_id);


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
-- Name: student_classes student_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_classes
    ADD CONSTRAINT student_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES upchieve.teacher_classes(id);


--
-- Name: student_classes student_classes_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.student_classes
    ADD CONSTRAINT student_classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.student_profiles(user_id);


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
-- Name: students_assignments students_assignments_assignment_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.students_assignments
    ADD CONSTRAINT students_assignments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES upchieve.assignments(id);


--
-- Name: students_assignments students_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.students_assignments
    ADD CONSTRAINT students_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.student_profiles(user_id);


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
-- Name: teacher_classes teacher_classes_topic_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_classes
    ADD CONSTRAINT teacher_classes_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES upchieve.topics(id);


--
-- Name: teacher_classes teacher_classes_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_classes
    ADD CONSTRAINT teacher_classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.teacher_profiles(user_id);


--
-- Name: teacher_profiles teacher_profiles_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_profiles
    ADD CONSTRAINT teacher_profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: teacher_profiles teacher_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: totp totp_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.totp
    ADD CONSTRAINT totp_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: tutor_bot_conversation_messages tutor_bot_conversation_messages_tutor_bot_conversation_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversation_messages
    ADD CONSTRAINT tutor_bot_conversation_messages_tutor_bot_conversation_id_fkey FOREIGN KEY (tutor_bot_conversation_id) REFERENCES upchieve.tutor_bot_conversations(id);


--
-- Name: tutor_bot_conversation_messages tutor_bot_conversation_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversation_messages
    ADD CONSTRAINT tutor_bot_conversation_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: tutor_bot_conversations tutor_bot_conversations_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversations
    ADD CONSTRAINT tutor_bot_conversations_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


--
-- Name: tutor_bot_conversations tutor_bot_conversations_subject_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversations
    ADD CONSTRAINT tutor_bot_conversations_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects(id);


--
-- Name: tutor_bot_conversations tutor_bot_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_conversations
    ADD CONSTRAINT tutor_bot_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


--
-- Name: tutor_bot_session_messages tutor_bot_session_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.tutor_bot_session_messages
    ADD CONSTRAINT tutor_bot_session_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES upchieve.sessions(id);


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
-- Name: users_grade_levels users_grade_levels_grade_level_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_grade_levels
    ADD CONSTRAINT users_grade_levels_grade_level_id_fkey FOREIGN KEY (grade_level_id) REFERENCES upchieve.grade_levels(id);


--
-- Name: users_grade_levels users_grade_levels_signup_grade_level_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_grade_levels
    ADD CONSTRAINT users_grade_levels_signup_grade_level_id_fkey FOREIGN KEY (signup_grade_level_id) REFERENCES upchieve.grade_levels(id);


--
-- Name: users_grade_levels users_grade_levels_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_grade_levels
    ADD CONSTRAINT users_grade_levels_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


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
-- Name: users_schools users_schools_school_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_schools
    ADD CONSTRAINT users_schools_school_id_fkey FOREIGN KEY (school_id) REFERENCES upchieve.schools(id);


--
-- Name: users_schools users_schools_user_id_fkey; Type: FK CONSTRAINT; Schema: upchieve; Owner: -
--

ALTER TABLE ONLY upchieve.users_schools
    ADD CONSTRAINT users_schools_user_id_fkey FOREIGN KEY (user_id) REFERENCES upchieve.users(id);


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

\unrestrict p3vmCkj9q8IbJPH7z1mjZ4BnxYnLKwZNf9twJXL6eKfOg5776bVC2yRjC6fsZ7u


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
    ('20231221230720'),
    ('20240222161927'),
    ('20240226144028'),
    ('20240320184030'),
    ('20240403012341'),
    ('20240517164134'),
    ('20240521195415'),
    ('20240522182235'),
    ('20240530165825'),
    ('20240612180331'),
    ('20240705012935'),
    ('20240708183519'),
    ('20240711180618'),
    ('20240723161108'),
    ('20240731165533'),
    ('20240809200824'),
    ('20240812190423'),
    ('20240828142138'),
    ('20240903213429'),
    ('20240906232026'),
    ('20240909182606'),
    ('20240910003849'),
    ('20240910010753'),
    ('20240912141821'),
    ('20240918170007'),
    ('20240918200433'),
    ('20240925165907'),
    ('20240930195105'),
    ('20241009204150'),
    ('20241018205145'),
    ('20241028142054'),
    ('20241028154216'),
    ('20241028173238'),
    ('20241031163051'),
    ('20241111210154'),
    ('20241120182555'),
    ('20241120182804'),
    ('20241120184235'),
    ('20241120210732'),
    ('20241216172437'),
    ('20241216172507'),
    ('20241216193347'),
    ('20241217040206'),
    ('20250121173556'),
    ('20250310173039'),
    ('20250312220532'),
    ('20250318175742'),
    ('20250326221322'),
    ('20250327202139'),
    ('20250401193833'),
    ('20250407171122'),
    ('20250407182416'),
    ('20250409193923'),
    ('20250514151906'),
    ('20250517000547'),
    ('20250521200939'),
    ('20250521232143'),
    ('20250522020702'),
    ('20250522182628'),
    ('20250530172930'),
    ('20250716141321'),
    ('20250801141806'),
    ('20250812230022'),
    ('20250818220035'),
    ('20250825164601'),
    ('20250918185105'),
    ('20250922200444'),
    ('20251008134946'),
    ('20251009150451'),
    ('20251014214939'),
    ('20251017145606'),
    ('20251029173028'),
    ('20251103144758'),
    ('20251104141004'),
    ('20251112181842'),
    ('20251113180824'),
    ('20251121162621'),
    ('20251121191436'),
    ('20251121214549'),
    ('20251125134512'),
    ('20251201200733'),
    ('20251202113843'),
    ('20251202114139'),
    ('20251205231954'),
    ('20251215171217'),
    ('20260114171204'),
    ('20260114193023'),
    ('20260122195918'),
    ('20260129185914'),
    ('20260129190242'),
    ('20260203194147'),
    ('20260203194734'),
    ('20260203200218'),
    ('20260204215802'),
    ('20260213143219'),
    ('20260219143230'),
    ('20260219151315'),
    ('20260219151836'),
    ('20260219154022'),
    ('20260225150417'),
    ('20260225150603'),
    ('20260227182642'),
    ('20260227183500'),
    ('20260302173903'),
    ('20260303184811'),
    ('20260305204138'),
    ('20260309135111'),
    ('20260310141305'),
    ('20260326212800'),
    ('20260408183957'),
    ('20260415134614'),
    ('20260423224528'),
    ('20260423230129'),
    ('20260428230130'),
    ('20260515002920'),
    ('20260515214142'),
    ('20260521184444'),
    ('20260602022152'),
    ('20260602031018'),
    ('20260622211455'),
    ('20260623012028');
