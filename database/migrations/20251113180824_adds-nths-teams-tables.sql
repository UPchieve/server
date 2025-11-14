-- migrate:up
CREATE TABLE upchieve.nths_groups (
    id uuid NOT NULL PRIMARY KEY,
    name text NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE upchieve.nths_group_members (
    PRIMARY KEY (nths_group_id, user_id),
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    title text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deactivated_at timestamp with time zone
);

-- migrate:down
DROP TABLE upchieve.nths_group_members;

DROP TABLE upchieve.nths_groups;

