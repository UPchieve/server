-- migrate:up
ALTER TYPE public.moderation_system SET SCHEMA upchieve;

ALTER TYPE public.paid_tutors_pilot_groups SET SCHEMA upchieve;

-- migrate:down
ALTER TYPE upchieve.moderation_system SET SCHEMA public;

ALTER TYPE upchieve.paid_tutors_pilot_groups SET SCHEMA public;

