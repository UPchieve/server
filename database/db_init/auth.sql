CREATE ROLE subway WITH LOGIN PASSWORD 'Password123';

GRANT ALL privileges ON ALL tables IN SCHEMA upchieve TO subway;

GRANT ALL privileges ON ALL sequences IN SCHEMA upchieve TO subway;

GRANT usage ON SCHEMA upchieve TO subway;

ALTER ROLE subway SET search_path = upchieve;

