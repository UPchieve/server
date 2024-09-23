-- migrate:up
CREATE OR REPLACE VIEW upchieve.fall_incentive_eligible_students AS
SELECT
    student_profiles.user_id,
    CASE WHEN student_profiles.created_at >= '2024-09-17 19:40:00.000000+00'
        AND (student_profiles.student_partner_org_id IS NULL
            OR student_profiles.student_partner_org_id NOT IN (
                SELECT
                    student_partner_org_id
                FROM
                    upchieve.fall_incentive_excluded_partner_orgs))
        AND federated_credentials.user_id IS NULL THEN
        TRUE
    ELSE
        FALSE
    END AS fall_incentive_eligible
FROM
    upchieve.student_profiles
    LEFT JOIN upchieve.federated_credentials ON student_profiles.user_id = federated_credentials.user_id
        AND federated_credentials.issuer = 'https://clever.com';

-- migrate:down
DROP VIEW IF EXISTS upchieve.fall_incentive_eligible_students;

