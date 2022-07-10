-- Create app user

CREATE ROLE subway WITH LOGIN PASSWORD 'Password123';

GRANT ALL privileges ON ALL tables IN SCHEMA upchieve TO subway;

GRANT ALL privileges ON ALL sequences IN SCHEMA upchieve TO subway;

GRANT usage ON SCHEMA upchieve TO subway;

ALTER ROLE subway SET search_path = upchieve;

GRANT ALL privileges ON ALL tables IN SCHEMA auth TO subway;

GRANT ALL privileges ON ALL sequences IN SCHEMA auth TO subway;

GRANT usage ON SCHEMA auth TO subway;

ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT ALL PRIVILEGES ON tables TO subway;

-- create staff read only user

CREATE ROLE staff_ro with LOGIN PASSWORD 'Password123';

GRANT SELECT ON ALL tables IN SCHEMA upchieve to staff_ro;

GRANT SELECT ON ALL sequences IN SCHEMA upchieve to staff_ro;

GRANT usage ON SCHEMA upchieve to staff_ro;

ALTER ROLE staff_ro SET search_path = upchieve;

GRANT SELECT ON ALL tables IN SCHEMA auth to staff_ro;

GRANT SELECT ON ALL sequences IN SCHEMA auth to staff_ro;

GRANT usage on SCHEMA auth to staff_ro;

ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT SELECT ON tables TO staff_ro;

-- create retool user

CREATE ROLE retool WITH LOGIN PASSWORD 'Password123';

GRANT ALL privileges ON ALL tables IN SCHEMA upchieve TO retool;

GRANT ALL privileges ON ALL sequences IN SCHEMA upchieve TO retool;

GRANT usage ON SCHEMA upchieve TO retool;

ALTER ROLE retool SET search_path = upchieve;

GRANT ALL privileges ON ALL tables IN SCHEMA auth TO retool;

GRANT ALL privileges ON ALL sequences IN SCHEMA auth TO retool;

GRANT usage ON SCHEMA auth TO retool;

ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT ALL PRIVILEGES ON tables TO retool;
