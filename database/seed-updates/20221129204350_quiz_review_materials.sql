-- migrate:up
INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'prealgebra') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/prealgebra-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/prealgebra-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/prealgebra-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/prealgebra-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'statistics') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/statistics-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/statistics-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/statistics-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/statistics-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'geometry') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/geometry-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/geometry-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/geometry-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/geometry-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'biology') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/biology-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/biology-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/biology-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/biology-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'chemistry') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/chemistry-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/chemistry-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/chemistry-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/chemistry-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'physicsOne') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/physicsone-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/physicsone-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/physicsone-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/physicsone-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'physicsTwo') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/physicstwo-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/physicstwo-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/physicstwo-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/physicstwo-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'environmentalScience') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/environmentalscience-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/environmentalscience-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/environmentalscience-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/environmentalscience-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'essays') AS subquery
    JOIN UNNEST(ARRAY['College Essays Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-essays-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-essays-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'collegeApps') AS subquery
    JOIN UNNEST(ARRAY['College Applications Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-applications-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-applications-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'planning') AS subquery
    JOIN UNNEST(ARRAY['College Planning Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-planning-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-planning-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'satMath') AS subquery
    JOIN UNNEST(ARRAY['SAT Math Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/sat-math-review-guide.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/sat-math-review-guide.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'satReading') AS subquery
    JOIN UNNEST(ARRAY['SAT Reading Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/sat-reading-review-guide.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/sat-reading-review-guide.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'humanitiesEssays') AS subquery
    JOIN UNNEST(ARRAY['Humanities Essays Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/humanities-essays-review-guide.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/humanities-essays-review-guide.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'algebraOne') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/algebraone-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/algebraone-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/algebraone-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/algebraone-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'algebraTwo') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/algebratwo-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/algebratwo-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/algebratwo-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/algebratwo-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'trigonometry') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/trigonometry-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/trigonometry-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/trigonometry-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/trigonometry-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'precalculus') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/precalculus-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/precalculus-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/precalculus-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/precalculus-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'calculusAB') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/calculusab-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/calculusab-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/calculusab-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/calculusab-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'calculusBC') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/calculusbc-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/calculusbc-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/calculusbc-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/calculusbc-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'reading') AS subquery
    JOIN UNNEST(ARRAY['Reading Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/reading-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/reading-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'financialAid') AS subquery
    JOIN UNNEST(ARRAY['Financial Aid Review'], ARRAY['https://cdn.upchieve.org/review-materials/financial-aid-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/financial-aid-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'applications') AS subquery
    JOIN UNNEST(ARRAY['Application Essays Review'], ARRAY['https://cdn.upchieve.org/review-materials/application-essays-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/application-essays-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'collegeApps') AS subquery
    JOIN UNNEST(ARRAY['College Applications Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-apps-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-apps-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'collegeList') AS subquery
    JOIN UNNEST(ARRAY['College List Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-list-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-list-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'collegePrep') AS subquery
    JOIN UNNEST(ARRAY['College Prep Review'], ARRAY['https://cdn.upchieve.org/review-materials/college-prep-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/college-prep-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'planning') AS subquery
    JOIN UNNEST(ARRAY['Essay Planning Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/essay-planning-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/essay-planning-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'essayFeedback') AS subquery
    JOIN UNNEST(ARRAY['Essay Feedback Review Guide'], ARRAY['https://cdn.upchieve.org/review-materials/essay-feedback-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/essay-feedback-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

INSERT INTO upchieve.quiz_review_materials (quiz_id, title, pdf, image, created_at, updated_at)
SELECT
    subquery.quiz_id,
    review_material.title,
    review_material.pdf,
    review_material.image,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id
    FROM
        upchieve.quizzes
    WHERE
        upchieve.quizzes.name = 'usHistory') AS subquery
    JOIN UNNEST(ARRAY['Topics & Resources', 'Concept Review'], ARRAY['https://cdn.upchieve.org/review-materials/ushistory-topics-and-resources.pdf', 'https://cdn.upchieve.org/review-materials/ushistory-concept-review.pdf'], ARRAY['https://cdn.upchieve.org/review-materials/ushistory-topics-and-resources.png', 'https://cdn.upchieve.org/review-materials/ushistory-concept-review.png']) AS review_material (title,
        pdf,
        image) ON TRUE;

-- migrate:down
DELETE FROM upchieve.quiz_review_materials;

