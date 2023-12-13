-- General App Role.
-- This role has read/write privileges to both the auth and upchieve schemas.
CREATE ROLE subway;
GRANT ALL privileges ON ALL tables IN SCHEMA upchieve TO subway;
GRANT ALL privileges ON ALL sequences IN SCHEMA upchieve TO subway;
GRANT usage ON SCHEMA upchieve TO subway;
ALTER ROLE subway SET search_path = upchieve;
GRANT ALL privileges ON ALL tables IN SCHEMA auth TO subway;
GRANT ALL privileges ON ALL sequences IN SCHEMA auth TO subway;
GRANT usage ON SCHEMA auth TO subway;
ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT ALL PRIVILEGES ON tables TO subway;

-- Staff Read-Only Role.
-- This role has read privileges to both the auth and upchieve schemas.
CREATE ROLE staff_ro;
GRANT SELECT ON ALL tables IN SCHEMA upchieve to staff_ro;
GRANT SELECT ON ALL sequences IN SCHEMA upchieve to staff_ro;
GRANT usage ON SCHEMA upchieve to staff_ro;
ALTER ROLE staff_ro SET search_path = upchieve;
GRANT SELECT ON ALL tables IN SCHEMA auth to staff_ro;
GRANT SELECT ON ALL sequences IN SCHEMA auth to staff_ro;
GRANT usage on SCHEMA auth to staff_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT SELECT ON tables TO staff_ro;

-- Retool Role.
-- Same as subway role above.
CREATE ROLE retool;
GRANT ALL privileges ON ALL tables IN SCHEMA upchieve TO retool;
GRANT ALL privileges ON ALL sequences IN SCHEMA upchieve TO retool;
GRANT usage ON SCHEMA upchieve TO retool;
ALTER ROLE retool SET search_path = upchieve;
GRANT ALL privileges ON ALL tables IN SCHEMA auth TO retool;
GRANT ALL privileges ON ALL sequences IN SCHEMA auth TO retool;
GRANT usage ON SCHEMA auth TO retool;
ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT ALL PRIVILEGES ON tables TO retool;

-- mat view owner role
-- subway needs to be able to refresh mat views, which requires ownership,
-- but admin/avnadmin needs superuser control over everything for down migrations to work correctly
CREATE ROLE mat_view_owners;
GRANT CREATE ON SCHEMA upchieve to mat_view_owners;
GRANT SELECT ON ALL tables IN SCHEMA upchieve to mat_view_owners;
ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT SELECT ON tables TO mat_view_owners;
GRANT mat_view_owners TO subway;
DO $$
BEGIN
  -- this is for local dev db owner user
  GRANT mat_view_owners to admin;
  -- this is for our cloud vendor owner user
  GRANT mat_view_owners TO avnadmin;
EXCEPTION
  -- ignore if one of the above fails because the role doesn't exist
  -- local dev fails if this script has an error so we have to catch and ignore
  WHEN OTHERS THEN NULL;
END;
$$;
-- put all mat view ownership moves below here
ALTER MATERIALIZED VIEW upchieve.users_subjects_mview OWNER TO mat_view_owners;

-- Basic Access Schema and Role.
-- The schema contains views for every table of the upchieve schema without the columns containing PII.
-- The basic_access role has read access to the basic_access schema, and the subway role has create access.
CREATE ROLE basic_access;
CREATE SCHEMA IF NOT EXISTS basic_access;
GRANT SELECT ON ALL tables IN SCHEMA basic_access TO basic_access;
GRANT usage ON SCHEMA basic_access TO basic_access;
ALTER ROLE basic_access SET search_path = basic_access;
ALTER DEFAULT PRIVILEGES IN SCHEMA basic_access GRANT SELECT ON tables TO basic_access;
-- Give subway role the privileges to create the views and the ability to give basic_access role select privileges.
GRANT CREATE ON SCHEMA basic_access TO subway;
GRANT usage on SCHEMA basic_access to subway;
ALTER DEFAULT PRIVILEGES FOR ROLE subway IN SCHEMA basic_access GRANT SELECT ON TABLES TO basic_access;
