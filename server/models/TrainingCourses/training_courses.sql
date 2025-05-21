/* @name getRequiredMaterialKeysByTrainingCourseName */
SELECT
    tcmm.key
FROM
    training_course_module_materials tcmm
    JOIN training_course_modules tcm ON tcm.id = tcmm.module_id
    JOIN training_courses tc ON tc.id = tcm.training_course_id
WHERE
    tcmm.required IS TRUE
    AND tc.name = :trainingCourseName!;


/* @name getTrainingCourseByName */
SELECT
    tc.id,
    tc.name,
    tc.description,
    q.name AS quiz_name,
    q.id AS quiz_id,
    tc.created_at,
    tc.updated_at
FROM
    training_courses tc
    LEFT JOIN quizzes q ON q.id = tc.quiz_id
WHERE
    tc.name = :trainingCourseName!;


/* @name getTrainingCourseModulesByTrainingCourseName */
SELECT
    tcm.*
FROM
    training_course_modules tcm
    JOIN training_courses tc ON tc.id = tcm.training_course_id
WHERE
    tc.name = :trainingCourseName!;


/* @name getTrainingCourseMaterialsByTrainingCourseName */
SELECT
    tcmm.*
FROM
    training_course_module_materials tcmm
    JOIN training_course_modules tcm ON tcm.id = tcmm.module_id
    JOIN training_courses tc ON tc.id = tcm.training_course_id
WHERE
    tc.name = :trainingCourseName!;

