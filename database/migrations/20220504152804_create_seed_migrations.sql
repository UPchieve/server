-- migrate:up
CREATE TABLE public.seed_migrations (
    version character varying(255) NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS public.seed_migrations;

