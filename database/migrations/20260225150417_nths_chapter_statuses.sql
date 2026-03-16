-- migrate:up
CREATE TABLE upchieve.nths_chapter_statuses (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE upchieve.nths_chapter_statuses;

