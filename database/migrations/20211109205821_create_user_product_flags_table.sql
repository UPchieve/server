-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.user_product_flags (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    sent_ready_to_coach_email boolean NOT NULL DEFAULT FALSE,
    sent_hour_summary_intro_email boolean NOT NULL DEFAULT FALSE,
    sent_inactive_thirty_day_email boolean NOT NULL DEFAULT FALSE,
    sent_inactive_sixty_day_email boolean NOT NULL DEFAULT FALSE,
    sent_inactive_ninety_day_email boolean NOT NULL DEFAULT FALSE,
    gates_qualified boolean NOT NULL DEFAULT FALSE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.user_product_flags CASCADE;

