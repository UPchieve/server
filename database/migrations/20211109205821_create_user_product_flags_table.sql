-- migrate:up
create table if not exists upchieve.user_product_flags (
    user_id uuid primary key references upchieve.users (id),
    sent_ready_to_coach_email boolean not null default false,
    sent_hour_summary_intro_email boolean not null default false,
    sent_inactive_thirty_day_email boolean not null default false,
    sent_inactive_sixty_day_email boolean not null default false,
    sent_inactive_ninety_day_email boolean not null default false,
    gates_qualified boolean not null default false,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.user_product_flags cascade;

