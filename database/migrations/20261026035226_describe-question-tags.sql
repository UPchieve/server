-- migrate:up
COMMENT ON TABLE upchieve.question_tags IS 'The impact study construct a survey question measures';

COMMENT ON TABLE upchieve.survey_questions_question_tags IS 'Which construct tags each survey question carries';

-- migrate:down
COMMENT ON TABLE upchieve.question_tags IS '@deprecated? It''s an empty table';

COMMENT ON TABLE upchieve.survey_questions_question_tags IS '@deprecated? Just an empty table';

