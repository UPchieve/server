-- migrate:up
CREATE TABLE photodna_quarantined_images (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES upchieve.users (id) ON DELETE CASCADE,
    upload_source text,
    created_at timestamptz DEFAULT NOW(),
    session_id uuid,
    photodna_tracking_id text,
    photodna_violations text,
    photodna_match_distance int,
    reported boolean
);

-- migrate:down
DROP TABLE photodna_quarantined_images;

