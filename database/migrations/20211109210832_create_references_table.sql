-- migrate:up
create table if not exists upchieve.references (
    id uuid primary key,
    user_id uuid not null references upchieve.users (id),
    first_name text not null,
    last_name text not null,
    email text not null,
    status_id int references upchieve.volunteer_reference_statuses (id),
    sent_at timestamp,
    affiliation text,
    relationship_length text,
    patient smallint,
    positive_role_model smallint,
    agreeable_and_approachable smallint,
    communicates_effectively smallint,
    rejection_reason text,
    additional_info text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.references cascade;

