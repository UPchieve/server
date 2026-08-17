-- migrate:up
-- Every application that exists so far came from the Google Form era, where the
-- only timestamp we kept was created_at. form_version 0 marks them, since 1 would
-- make them indistinguishable from a real in-app submission.
--
-- Scoped to rows with no responses so a rerun cannot touch a genuine v1
-- application: the form has required questions, so a real submission always
-- stores answers.
UPDATE
    upchieve.nths_candidate_applications
SET
    form_version = 0,
    decided_at = CASE WHEN status <> 'applied' THEN
        created_at
    END,
    activated_at = CASE WHEN status = 'approved' THEN
        created_at
    END
WHERE
    responses = '{}'::jsonb;

-- migrate:down
UPDATE
    upchieve.nths_candidate_applications
SET
    form_version = 1,
    decided_at = NULL,
    activated_at = NULL
WHERE
    form_version = 0;

