-- migrate:up
ALTER TABLE upchieve.school_nces_metadata
    ADD COLUMN is_school_wide_title1 boolean DEFAULT FALSE NOT NULL,
    ADD COLUMN is_title1_eligible boolean DEFAULT FALSE NOT NULL,
    ADD COLUMN national_school_lunch_program text,
    ADD COLUMN total_students int,
    ADD COLUMN nslp_direct_certification int,
    ADD COLUMN frl_eligible int;

-- migrate:down
ALTER TABLE upchieve.school_nces_metadata
    DROP COLUMN is_school_wide_title1,
    DROP COLUMN is_title1_eligible,
    DROP COLUMN national_school_lunch_program,
    DROP COLUMN total_students,
    DROP COLUMN nslp_direct_certification,
    DROP COLUMN frl_eligible;

