-- migrate:up
-- school_id stays nullable: we don't want to prevent submission for users
-- that can't find their school and will instead capture the unlisted_school
-- json blob so we can manually attempt to associate a school ourselves.
ALTER TABLE upchieve.nths_candidate_applications
    ADD COLUMN school_id uuid REFERENCES upchieve.schools (id),
    ADD COLUMN unlisted_school jsonb,
    ADD COLUMN form_version integer NOT NULL DEFAULT 1,
    ADD COLUMN responses jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN decided_at timestamptz,
    ADD COLUMN activated_at timestamptz,
    ADD CONSTRAINT unlisted_school_is_an_object CHECK (unlisted_school IS NULL OR jsonb_typeof(unlisted_school) = 'object'),
    ADD CONSTRAINT responses_is_an_object CHECK (jsonb_typeof(responses) = 'object'),
    ADD CONSTRAINT activation_requires_approval CHECK (activated_at IS NULL OR status = 'approved');

COMMENT ON COLUMN upchieve.nths_candidate_applications.school_id IS 'pii: Foreign key to upchieve.schools';

-- This will hold information that we can use to try to manually identify
-- identify a valid school from the NCES database. Held separately from
-- the other application form responses since this information is not subject
-- to the form_version and can ultimately get replaced by a manual update
-- of real school id association
COMMENT ON COLUMN upchieve.nths_candidate_applications.unlisted_school IS 'pii: Name, city, state, and website of the applicant''s school as they described it, when it could not be matched to upchieve.schools';

COMMENT ON COLUMN upchieve.nths_candidate_applications.form_version IS 'not_pii: Version of the application form these responses were collected with; 0 means it predates the in-app form and has no responses';

COMMENT ON COLUMN upchieve.nths_candidate_applications.responses IS 'pii: Applicant answers to the NTHS president application form';

COMMENT ON COLUMN upchieve.nths_candidate_applications.decided_at IS 'not_pii: When the application was approved or denied';

-- `decided_at` marks when an application was "approved" or "denied" but in
-- the case where we automate the approval process we want to have an artificial
-- delay before the candidate is notified and they are actually allowed to start
-- the chapter. This `activated_at` field is what the automated process will set
-- via a time-delay and once set, it indicates that the student can actually
-- proceed with creating the new chapter.
COMMENT ON COLUMN upchieve.nths_candidate_applications.activated_at IS 'not_pii: When the approval was revealed to the applicant and chapter creation unlocked';

-- Applications are deliberately left unconstrained by school. One school can
-- hold only one chapter, but nths_group_school_affiliation.unique_school_id
-- already enforces that, and blocking here would throw away essays written by the
-- later applicants from a school while a decision is pending.
CREATE UNIQUE INDEX nths_one_pending_application_per_user ON upchieve.nths_candidate_applications (user_id)
WHERE
    status = 'applied';

-- migrate:down
DROP INDEX upchieve.nths_one_pending_application_per_user;

ALTER TABLE upchieve.nths_candidate_applications
    DROP COLUMN school_id,
    DROP COLUMN unlisted_school,
    DROP COLUMN form_version,
    DROP COLUMN responses,
    DROP COLUMN decided_at,
    DROP COLUMN activated_at;

