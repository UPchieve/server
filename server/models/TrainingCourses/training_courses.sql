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

