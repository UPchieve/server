/* @name getSubjectAndTopic */
SELECT
    subjects.name AS subject_name,
    subjects.display_name AS subject_display_name,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name
FROM
    subjects
    JOIN topics ON subjects.topic_id = topics.id
WHERE
    subjects.name = :subject!
    AND topics.name = :topic!;


/* @name getSubjects */
SELECT
    subjects.id AS id,
    subjects.name AS name,
    subjects.display_name AS display_name,
    subjects.display_order AS display_order,
    subjects.active AS active,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name,
    topics.dashboard_order AS topic_dashboard_order,
    topics.training_order AS topic_training_order,
    topics.id AS topic_id,
    topics.icon_link AS topic_icon_link,
    topics.color AS topic_color
FROM
    subjects
    JOIN topics ON subjects.topic_id = topics.id;


/* @name getTopics */
SELECT
    id,
    name,
    display_name,
    icon_link,
    dashboard_order,
    training_order
FROM
    topics;


/* @name getTrainingCourses */
SELECT
    id,
    name,
    display_name
FROM
    training_courses;


/* @name getQuizCertUnlocks */
SELECT
    quizzes.name AS quiz_name,
    quiz_info.display_name AS quiz_display_name,
    quiz_info.display_order AS quiz_display_order,
    certs.name AS unlocked_cert_name,
    cert_info.display_name AS unlocked_cert_display_name,
    cert_info.display_order AS unlocked_cert_display_order,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name,
    topics.dashboard_order AS topic_dashboard_order,
    topics.training_order AS topic_training_order,
    quizzes.active AS quiz_is_active
FROM
    quiz_certification_grants qcg
    JOIN quizzes ON quizzes.id = qcg.quiz_id
    JOIN subjects AS quiz_info ON quiz_info.name = quizzes.name
    JOIN certifications certs ON certs.id = qcg.certification_id
    JOIN subjects AS cert_info ON cert_info.name = certs.name
    JOIN topics ON topics.id = cert_info.topic_id;


/* @name getCertSubjectUnlocks */
SELECT
    unlocked_subject.name AS unlocked_subject_name,
    unlocked_subject.display_name AS unlocked_subject_display_name,
    unlocked_subject.display_order AS unlocked_subject_display_order,
    certifications.name AS cert_name,
    cert_info.display_name AS cert_display_name,
    cert_info.display_order AS cert_display_order,
    topics.name AS topic_name
FROM
    certification_subject_unlocks csu
    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id
    JOIN certifications ON certifications.id = csu.certification_id
    JOIN topics ON topics.id = unlocked_subject.topic_id
    JOIN subjects AS cert_info ON cert_info.name = certifications.name;


/* @name getComputedSubjectUnlocks */
SELECT
    unlocked_subject.name AS unlocked_subject_name,
    unlocked_subject.display_name AS unlocked_subject_display_name,
    unlocked_subject.display_order AS unlocked_subject_display_order,
    certifications.name AS cert_name,
    cert_info.display_name AS cert_display_name,
    cert_info.display_order AS cert_display_order,
    topics.name AS topic_name
FROM
    computed_subject_unlocks csu
    JOIN subjects AS unlocked_subject ON unlocked_subject.id = csu.subject_id
    JOIN certifications ON certifications.id = csu.certification_id
    JOIN topics ON topics.id = unlocked_subject.topic_id
    JOIN subjects AS cert_info ON cert_info.name = certifications.name;


/* @name getSubjectType */
SELECT
    CASE WHEN topics.name IS NOT NULL THEN
        topics.name
    WHEN tc.name IS NOT NULL THEN
        'training'
    ELSE
        ''
    END AS subject_type
FROM
    quizzes
    LEFT JOIN subjects ON subjects.name = quizzes.name
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN training_courses tc ON tc.name = quizzes.name
WHERE
    quizzes.name = :subject!;


/* @name getSubjectNameIdMapping */
SELECT
    subjects.name,
    subjects.id
FROM
    upchieve.subjects;

