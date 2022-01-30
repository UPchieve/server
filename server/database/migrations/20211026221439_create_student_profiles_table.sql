-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.student_profiles (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    college text,
    school_id uuid REFERENCES upchieve.schools (id),
    postal_code varchar(2) REFERENCES upchieve.postal_codes (code),
    grade_level_id int REFERENCES upchieve.grade_levels (id),
    student_partner_org_user_id uuid,
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    student_partner_org_site_id uuid REFERENCES upchieve.student_partner_org_sites (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_profiles CASCADE;

