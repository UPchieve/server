-- migrate:up
create table if not exists upchieve.user_session_metrics (
    user_id uuid primary key references upchieve.users (id),
    absent_student int not null default 0,
    absent_volunteer int not null default 0,
    low_session_rating_from_coach int not null default 0,
    low_session_rating_from_student int not null default 0,
    low_coach_rating_from_student int not null default 0,
    reported int not null default 0,
    only_looking_for_answers int not null default 0,
    rude_or_inappropriate int not null default 0,
    comment_from_student int not null default 0,
    comment_from_volunteer int not null default 0,
    has_been_unmatched int not null default 0,
    has_had_technical_issues int not null default 0,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.user_session_metrics cascade;

