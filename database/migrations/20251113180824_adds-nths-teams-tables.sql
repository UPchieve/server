-- migrate:up
CREATE TABLE upchieve.nths_groups (
    id uuid NOT NULL PRIMARY KEY,
    name text NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE upchieve.nths_group_members (
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    title text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX nths_group_members_group_id ON upchieve.nths_group_members (nths_group_id);

CREATE INDEX nths_group_members_user_id ON upchieve.nths_group_members (user_id);

-- migrate:down
DROP INDEX upchieve.nths_group_members_group_id;

DROP INDEX upchieve.nths_group_members_user_id;

DROP TABLE upchieve.nths_group_members;

DROP TABLE upchieve.nths_groups;

