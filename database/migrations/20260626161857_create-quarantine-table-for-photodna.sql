-- migrate:up
CREATE TABLE photodna_quarantined_images (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES upchieve.users (id) ON DELETE CASCADE,
    upload_type text,
    created_at timestamptz DEFAULT NOW(),
    session_id uuid,
    photodna_tracking_id text,
    photodna_response text
);

-- migrate:down
DROP TABLE photodna_quarantined_images;

