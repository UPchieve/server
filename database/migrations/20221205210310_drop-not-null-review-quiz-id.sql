-- migrate:up
ALTER TABLE ONLY upchieve.quiz_review_materials
    ALTER COLUMN quiz_id DROP NOT NULL;

-- migrate:down
ALTER TABLE ONLY upchieve.quiz_review_materials
    ALTER COLUMN quiz_id SET NOT NULL;

