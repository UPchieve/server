-- migrate:up
ALTER TABLE upchieve.volunteer_references
    ADD COLUMN trustworthy_with_children smallint;

-- migrate:down
ALTER TABLE upchieve.volunteer_references
    DROP COLUMN trustworthy_with_children;

