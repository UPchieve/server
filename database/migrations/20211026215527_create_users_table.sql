-- migrate:up
create table if not exists upchieve.users (
    id uuid primary key,
    verified boolean not null default false,
    email_verified boolean not null default false,
    phone_verified boolean not null default false,
    email text not null unique,
    password text not null,
    password_reset_token text,
    first_name text not null,
    last_name text not null,
    deactivated boolean not null default false,
    last_activity_at timestamp,
    referral_code text not null unique,
    referred_by uuid,
    test_user boolean not null default false,
    banned boolean not null default false,
    ban_reason_id int references upchieve.ban_reasons (id),
    time_tutored bigint,
    signup_source_id int references upchieve.signup_sources (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.users cascade;

