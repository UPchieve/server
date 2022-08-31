-- migrate:up
UPDATE
    upchieve.survey_response_choices
SET
    display_image = 'https://cdn.upchieve.org/site-images/star.svg',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Not at all'
    OR upchieve.survey_response_choices.choice_text = 'Sorta but not really'
    OR upchieve.survey_response_choices.choice_text = 'I guess so'
    OR upchieve.survey_response_choices.choice_text = 'I''m def closer to my goal'
    OR upchieve.survey_response_choices.choice_text = 'GOAL ACHIEVED'
    OR upchieve.survey_response_choices.choice_text = 'Somewhat'
    OR upchieve.survey_response_choices.choice_text = 'Mostly'
    OR upchieve.survey_response_choices.choice_text = 'A lot';

-- migrate:down
UPDATE
    upchieve.survey_response_choices
SET
    display_image = NULL,
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Not at all'
    OR upchieve.survey_response_choices.choice_text = 'Sorta but not really'
    OR upchieve.survey_response_choices.choice_text = 'I guess so'
    OR upchieve.survey_response_choices.choice_text = 'I''m def closer to my goal'
    OR upchieve.survey_response_choices.choice_text = 'GOAL ACHIEVED'
    OR upchieve.survey_response_choices.choice_text = 'Somewhat'
    OR upchieve.survey_response_choices.choice_text = 'Mostly'
    OR upchieve.survey_response_choices.choice_text = 'A lot';

