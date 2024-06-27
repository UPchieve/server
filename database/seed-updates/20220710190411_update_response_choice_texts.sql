-- migrate:up
UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Deepen my understanding of a topic',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Improve my understanding of a topic';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Deepen my understanding of a concept',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Improve my understanding of a concept';

-- migrate:down
UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Improve my understanding of a topic',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Deepen my understanding of a topic';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Improve my understanding of a concept',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Deepen my understanding of a concept';

