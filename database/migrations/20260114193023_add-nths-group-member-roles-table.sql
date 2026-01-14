-- migrate:up
CREATE TABLE upchieve.nths_group_member_roles (
    user_id uuid REFERENCES upchieve.users (id),
    nths_group_id uuid REFERENCES upchieve.nths_groups (id),
    role_id int REFERENCES upchieve.nths_group_roles (id),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, nths_group_id)
);

-- migrate:down
DROP TABLE upchieve.nths_group_member_roles;

