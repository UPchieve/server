-- migrate:up
create table if not exists upchieve.quiz_certification_grants (
    quiz_id int not null references upchieve.quizzes (id),
    certification_id int not null references upchieve.certifications (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (certification_id, quiz_id)
);

-- migrate:down
drop table if exists upchieve.quiz_certification_grants cascade;