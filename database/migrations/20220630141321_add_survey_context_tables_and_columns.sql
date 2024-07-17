-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_types (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

DROP TABLE IF EXISTS upchieve.surveys_presession CASCADE;

DROP TABLE IF EXISTS upchieve.surveys_postsession CASCADE;

CREATE TABLE IF NOT EXISTS upchieve.surveys_context (
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    subject_id integer REFERENCES upchieve.subjects (id),
    survey_type_id integer NOT NULL REFERENCES upchieve.survey_types (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

DROP TABLE IF EXISTS upchieve.users_surveys CASCADE;

CREATE TABLE IF NOT EXISTS upchieve.users_surveys (
    id uuid PRIMARY KEY,
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid REFERENCES upchieve.sessions (id),
    survey_type_id integer NOT NULL REFERENCES upchieve.survey_types (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.surveys_context CASCADE;

CREATE TABLE IF NOT EXISTS upchieve.surveys_presession (
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    subject_id integer REFERENCES upchieve.subjects (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS upchieve.surveys_postsession (
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    subject_id integer REFERENCES upchieve.subjects (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

DROP TABLE IF EXISTS upchieve.users_surveys CASCADE;

CREATE TABLE IF NOT EXISTS upchieve.users_surveys (
    id uuid PRIMARY KEY,
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

DROP TABLE IF EXISTS upchieve.survey_types CASCADE;

