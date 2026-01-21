-- migrate:up
CREATE TABLE upchieve.nths_group_roles (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(20)
);

-- migrate:down
DROP TABLE upchieve.nths_group_roles;

