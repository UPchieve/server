-- migrate:up
create table if not exists upchieve.certification_subject_unlocks (
    subject_id int not null references upchieve.subjects (id),
    certification_id int not null references upchieve.certifications (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (subject_id, certification_id)
);

-- migrate:down
drop table if exists upchieve.certification_subject_unlocks cascade;

