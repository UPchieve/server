-- migrate:up
INSERT INTO upchieve.progress_report_prompts (subject_id, prompt, active, created_at, updated_at)
SELECT
    subquery.subject_id,
    'Analyze transcripts from a series of high school reading tutoring sessions involving the same student. 
    Predict the topics for the student''s next quiz and assess their likely performance. 
    Highlight the areas where the student is expected to excel, 
    based on the dialogue and editor content provided in each session. 
    The format of the transcripts is:

    Session:
    [hh:mm:ss] Tutor: {message}
    [hh:mm:ss] Student: {message}

    Editor:
    {editorContent}

    The editor content is a JSON representation of a Quill Editor document in Quill''s Delta format. 
    The Delta format is a series of operations applied to the document. 
    Both the student and the tutor can commit operations. You will not know the author of an operation, 
    although you can assume that students insert the early original content into the document; 
    tutors may make edits intended to represent annotations, corrections, examples, and other kinds of feedback; 
    and students may make additional edits to respond to the tutor''s feedback. 

    {{responseInstructions}}',
    TRUE,
    NOW(),
    NOW()
FROM (
    SELECT
        id AS subject_id
    FROM
        upchieve.subjects
    WHERE
        upchieve.subjects.name = 'reading') AS subquery;

-- migrate:down
DELETE FROM upchieve.progress_report_prompts;

