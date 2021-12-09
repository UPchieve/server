-- migrate:up
create table if not exists upchieve.users_certifications (
    user_id uuid not null references upchieve.users (id),
    certification_id int not null references upchieve.certifications (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (user_id, certification_id)
);

-- migrate:down
drop table if exists upchieve.users_certifications cascade;