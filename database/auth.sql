create role subway with login password 'Password123';

grant all privileges on all tables in schema upchieve to subway;
grant all privileges on all sequences in schema upchieve to subway;
grant usage on schema upchieve to subway;

alter role subway set search_path = upchieve;
