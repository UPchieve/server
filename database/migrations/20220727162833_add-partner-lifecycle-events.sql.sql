-- migrate:up
ALTER TABLE upchieve.student_partner_orgs
  ADD COLUMN active boolean NOT NULL default TRUE;

CREATE TABLE IF NOT EXISTS upchieve.partner_org_lifecycle_events (
    id int PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS upchieve.student_partner_org_lifecycle_event (
    student_partner_org_id uuid NOT NULL REFERENCES upchieve.student_partner_orgs (id),
    lifecycle_event_id int NOT NULL REFERENCES upchieve.partner_org_lifecycle_events (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS upchieve.volunteer_partner_org_lifecycle_event (
    volunteer_partner_org_id uuid NOT NULL REFERENCES upchieve.volunteer_partner_orgs (id),
    lifecycle_event_id int NOT NULL REFERENCES upchieve.partner_org_lifecycle_events (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.volunteer_partner_org_lifecycle_event;
DROP TABLE IF EXISTS upchieve.student_partner_org_lifecycle_event;
DROP TABLE IF EXISTS upchieve.partner_org_lifecycle_events;
ALTER TABLE upchieve.student_partner_orgs
  DROP COLUMN active;
