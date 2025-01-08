/** Types generated for queries found in "server/models/Assignments/assignments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'CreateAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateAssignmentResult = never;

/** Query 'CreateAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateAssignmentParams = never;

const createAssignmentIR: any = {"usedParamSet":{"id":true,"classId":true,"description":true,"title":true,"numberOfSessions":true,"minDurationInMinutes":true,"dueDate":true,"isRequired":true,"startDate":true,"subjectId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":190}]},{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":201}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":204,"b":215}]},{"name":"title","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":223}]},{"name":"numberOfSessions","required":false,"transform":{"type":"scalar"},"locs":[{"a":226,"b":242}]},{"name":"minDurationInMinutes","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":265}]},{"name":"dueDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":268,"b":275}]},{"name":"isRequired","required":false,"transform":{"type":"scalar"},"locs":[{"a":278,"b":288}]},{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":291,"b":300}]},{"name":"subjectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":303,"b":312}]}],"statement":"INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)\n    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())\nRETURNING\n    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)
 *     VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())
 * RETURNING
 *     id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at
 * ```
 */
export const createAssignment = new PreparedQuery<ICreateAssignmentParams,ICreateAssignmentResult>(createAssignmentIR);


/** Query 'GetAssignmentsByClassId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssignmentsByClassIdResult = never;

/** Query 'GetAssignmentsByClassId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssignmentsByClassIdParams = never;

const getAssignmentsByClassIdIR: any = {"usedParamSet":{"classId":true},"params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":196,"b":204}]}],"statement":"SELECT\n    assignments.*,\n    ARRAY_AGG(sa.user_id) AS student_ids\nFROM\n    assignments\n    LEFT JOIN students_assignments sa ON assignments.id = sa.assignment_id\nWHERE\n    assignments.class_id = :classId!\nGROUP BY\n    assignments.id,\n    assignments.class_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     assignments.*,
 *     ARRAY_AGG(sa.user_id) AS student_ids
 * FROM
 *     assignments
 *     LEFT JOIN students_assignments sa ON assignments.id = sa.assignment_id
 * WHERE
 *     assignments.class_id = :classId!
 * GROUP BY
 *     assignments.id,
 *     assignments.class_id
 * ```
 */
export const getAssignmentsByClassId = new PreparedQuery<IGetAssignmentsByClassIdParams,IGetAssignmentsByClassIdResult>(getAssignmentsByClassIdIR);


/** Query 'GetAssignmentById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssignmentByIdResult = never;

/** Query 'GetAssignmentById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssignmentByIdParams = never;

const getAssignmentByIdIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":171,"b":184}]}],"statement":"SELECT\n    assignments.*,\n    subjects.name AS subject_name\nFROM\n    assignments\n    LEFT JOIN subjects ON assignments.subject_id = subjects.id\nWHERE\n    assignments.id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     assignments.*,
 *     subjects.name AS subject_name
 * FROM
 *     assignments
 *     LEFT JOIN subjects ON assignments.subject_id = subjects.id
 * WHERE
 *     assignments.id = :assignmentId!
 * ```
 */
export const getAssignmentById = new PreparedQuery<IGetAssignmentByIdParams,IGetAssignmentByIdResult>(getAssignmentByIdIR);


/** Query 'CreateStudentAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateStudentAssignmentResult = never;

/** Query 'CreateStudentAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateStudentAssignmentParams = never;

const createStudentAssignmentIR: any = {"usedParamSet":{"userId":true,"assignmentId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":101}]},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":117}]}],"statement":"INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at)\n    VALUES (:userId!, :assignmentId!, NOW(), NOW())\nRETURNING\n    user_id, assignment_id, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at)
 *     VALUES (:userId!, :assignmentId!, NOW(), NOW())
 * RETURNING
 *     user_id, assignment_id, created_at, updated_at
 * ```
 */
export const createStudentAssignment = new PreparedQuery<ICreateStudentAssignmentParams,ICreateStudentAssignmentResult>(createStudentAssignmentIR);


/** Query 'CreateStudentAssignments' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateStudentAssignmentsResult = never;

/** Query 'CreateStudentAssignments' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateStudentAssignmentsParams = never;

const createStudentAssignmentsIR: any = {"usedParamSet":{"studentAssignments":true},"params":[{"name":"studentAssignments","required":true,"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":true},{"name":"assignmentId","required":true}]},"locs":[{"a":77,"b":96}]}],"statement":"INSERT INTO students_assignments (user_id, assignment_id)\n    VALUES\n        :studentAssignments!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id, assignment_id, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO students_assignments (user_id, assignment_id)
 *     VALUES
 *         :studentAssignments!
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         user_id, assignment_id, created_at, updated_at
 * ```
 */
export const createStudentAssignments = new PreparedQuery<ICreateStudentAssignmentsParams,ICreateStudentAssignmentsResult>(createStudentAssignmentsIR);


/** Query 'UpdateSubmittedAtOfStudentAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateSubmittedAtOfStudentAssignmentResult = never;

/** Query 'UpdateSubmittedAtOfStudentAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateSubmittedAtOfStudentAssignmentParams = never;

const updateSubmittedAtOfStudentAssignmentIR: any = {"usedParamSet":{"userId":true,"assignmentId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":127}]}],"statement":"UPDATE\n    students_assignments\nSET\n    submitted_at = NOW()\nWHERE\n    user_id = :userId!\n    AND assignment_id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     students_assignments
 * SET
 *     submitted_at = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND assignment_id = :assignmentId!
 * ```
 */
export const updateSubmittedAtOfStudentAssignment = new PreparedQuery<IUpdateSubmittedAtOfStudentAssignmentParams,IUpdateSubmittedAtOfStudentAssignmentResult>(updateSubmittedAtOfStudentAssignmentIR);


/** Query 'GetAssignmentsByStudentId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAssignmentsByStudentIdResult = never;

/** Query 'GetAssignmentsByStudentId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAssignmentsByStudentIdParams = never;

const getAssignmentsByStudentIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":633,"b":640}]}],"statement":"SELECT\n    assignments.id,\n    students_assignments.created_at AS assigned_at,\n    assignments.class_id,\n    assignments.description,\n    assignments.title,\n    assignments.number_of_sessions,\n    assignments.min_duration_in_minutes,\n    assignments.is_required,\n    assignments.due_date,\n    assignments.start_date,\n    assignments.subject_id,\n    subjects.name AS subject_name,\n    students_assignments.submitted_at\nFROM\n    assignments\n    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id\n    LEFT JOIN subjects ON assignments.subject_id = subjects.id\nWHERE\n    students_assignments.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     assignments.id,
 *     students_assignments.created_at AS assigned_at,
 *     assignments.class_id,
 *     assignments.description,
 *     assignments.title,
 *     assignments.number_of_sessions,
 *     assignments.min_duration_in_minutes,
 *     assignments.is_required,
 *     assignments.due_date,
 *     assignments.start_date,
 *     assignments.subject_id,
 *     subjects.name AS subject_name,
 *     students_assignments.submitted_at
 * FROM
 *     assignments
 *     LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id
 *     LEFT JOIN subjects ON assignments.subject_id = subjects.id
 * WHERE
 *     students_assignments.user_id = :userId!
 * ```
 */
export const getAssignmentsByStudentId = new PreparedQuery<IGetAssignmentsByStudentIdParams,IGetAssignmentsByStudentIdResult>(getAssignmentsByStudentIdIR);


/** Query 'GetAllAssignmentsForTeacher' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetAllAssignmentsForTeacherResult = never;

/** Query 'GetAllAssignmentsForTeacher' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetAllAssignmentsForTeacherParams = never;

const getAllAssignmentsForTeacherIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":159}]}],"statement":"SELECT\n    assignments.*\nFROM\n    assignments\n    JOIN teacher_classes ON assignments.class_id = teacher_classes.id\nWHERE\n    teacher_classes.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     assignments.*
 * FROM
 *     assignments
 *     JOIN teacher_classes ON assignments.class_id = teacher_classes.id
 * WHERE
 *     teacher_classes.user_id = :userId!
 * ```
 */
export const getAllAssignmentsForTeacher = new PreparedQuery<IGetAllAssignmentsForTeacherParams,IGetAllAssignmentsForTeacherResult>(getAllAssignmentsForTeacherIR);


/** Query 'GetStudentAssignmentCompletion' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentAssignmentCompletionResult = never;

/** Query 'GetStudentAssignmentCompletion' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentAssignmentCompletionParams = never;

const getStudentAssignmentCompletionIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":228,"b":241}]}],"statement":"SELECT\n    users.first_name,\n    users.last_name,\n    students_assignments.submitted_at\nFROM\n    students_assignments\n    LEFT JOIN users ON students_assignments.user_id = users.id\nWHERE\n    students_assignments.assignment_id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.first_name,
 *     users.last_name,
 *     students_assignments.submitted_at
 * FROM
 *     students_assignments
 *     LEFT JOIN users ON students_assignments.user_id = users.id
 * WHERE
 *     students_assignments.assignment_id = :assignmentId!
 * ```
 */
export const getStudentAssignmentCompletion = new PreparedQuery<IGetStudentAssignmentCompletionParams,IGetStudentAssignmentCompletionResult>(getStudentAssignmentCompletionIR);


/** Query 'GetStudentAssignmentForSession' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentAssignmentForSessionResult = never;

/** Query 'GetStudentAssignmentForSession' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentAssignmentForSessionParams = never;

const getStudentAssignmentForSessionIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":575,"b":584}]}],"statement":"SELECT\n    a.id,\n    a.class_id,\n    a.title,\n    a.description,\n    a.number_of_sessions,\n    a.min_duration_in_minutes,\n    a.due_date,\n    a.start_date,\n    a.subject_id,\n    a.is_required,\n    subjects.name AS subject_name,\n    sa.created_at AS assigned_at,\n    sa.submitted_at\nFROM\n    assignments a\n    LEFT JOIN students_assignments sa ON sa.assignment_id = a.id\n    LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id\n        AND ssa.user_id = sa.user_id\n    LEFT JOIN subjects ON a.subject_id = subjects.id\nWHERE\n    ssa.session_id = :sessionId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     a.id,
 *     a.class_id,
 *     a.title,
 *     a.description,
 *     a.number_of_sessions,
 *     a.min_duration_in_minutes,
 *     a.due_date,
 *     a.start_date,
 *     a.subject_id,
 *     a.is_required,
 *     subjects.name AS subject_name,
 *     sa.created_at AS assigned_at,
 *     sa.submitted_at
 * FROM
 *     assignments a
 *     LEFT JOIN students_assignments sa ON sa.assignment_id = a.id
 *     LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id
 *         AND ssa.user_id = sa.user_id
 *     LEFT JOIN subjects ON a.subject_id = subjects.id
 * WHERE
 *     ssa.session_id = :sessionId
 * ```
 */
export const getStudentAssignmentForSession = new PreparedQuery<IGetStudentAssignmentForSessionParams,IGetStudentAssignmentForSessionResult>(getStudentAssignmentForSessionIR);


/** Query 'LinkSessionToAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type ILinkSessionToAssignmentResult = never;

/** Query 'LinkSessionToAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ILinkSessionToAssignmentParams = never;

const linkSessionToAssignmentIR: any = {"usedParamSet":{"sessionId":true,"userId":true,"assignmentId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":101}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":127}]}],"statement":"INSERT INTO sessions_students_assignments (session_id, user_id, assignment_id)\n    VALUES (:sessionId!, :userId!, :assignmentId!)\nON CONFLICT\n    DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO sessions_students_assignments (session_id, user_id, assignment_id)
 *     VALUES (:sessionId!, :userId!, :assignmentId!)
 * ON CONFLICT
 *     DO NOTHING
 * ```
 */
export const linkSessionToAssignment = new PreparedQuery<ILinkSessionToAssignmentParams,ILinkSessionToAssignmentResult>(linkSessionToAssignmentIR);


/** Query 'GetSessionsForStudentAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetSessionsForStudentAssignmentResult = never;

/** Query 'GetSessionsForStudentAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetSessionsForStudentAssignmentParams = never;

const getSessionsForStudentAssignmentIR: any = {"usedParamSet":{"userId":true,"assignmentId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":184}]},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":223}]}],"statement":"SELECT\n    s.volunteer_joined_at,\n    s.ended_at,\n    s.time_tutored\nFROM\n    sessions_students_assignments ssa\n    JOIN sessions s ON s.id = ssa.session_id\nWHERE\n    user_id = :userId!\n    AND assignment_id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     s.volunteer_joined_at,
 *     s.ended_at,
 *     s.time_tutored
 * FROM
 *     sessions_students_assignments ssa
 *     JOIN sessions s ON s.id = ssa.session_id
 * WHERE
 *     user_id = :userId!
 *     AND assignment_id = :assignmentId!
 * ```
 */
export const getSessionsForStudentAssignment = new PreparedQuery<IGetSessionsForStudentAssignmentParams,IGetSessionsForStudentAssignmentResult>(getSessionsForStudentAssignmentIR);


/** Query 'DeleteStudentAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteStudentAssignmentResult = never;

/** Query 'DeleteStudentAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteStudentAssignmentParams = never;

const deleteStudentAssignmentIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":68}]}],"statement":"DELETE FROM students_assignments\nWHERE assignment_id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM students_assignments
 * WHERE assignment_id = :assignmentId!
 * ```
 */
export const deleteStudentAssignment = new PreparedQuery<IDeleteStudentAssignmentParams,IDeleteStudentAssignmentResult>(deleteStudentAssignmentIR);


/** Query 'DeleteAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteAssignmentResult = never;

/** Query 'DeleteAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteAssignmentParams = never;

const deleteAssignmentIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":48}]}],"statement":"DELETE FROM assignments\nWHERE id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM assignments
 * WHERE id = :assignmentId!
 * ```
 */
export const deleteAssignment = new PreparedQuery<IDeleteAssignmentParams,IDeleteAssignmentResult>(deleteAssignmentIR);


/** Query 'DeleteSessionForStudentAssignment' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteSessionForStudentAssignmentResult = never;

/** Query 'DeleteSessionForStudentAssignment' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteSessionForStudentAssignmentParams = never;

const deleteSessionForStudentAssignmentIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":77}]}],"statement":"DELETE FROM sessions_students_assignments\nWHERE assignment_id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM sessions_students_assignments
 * WHERE assignment_id = :assignmentId!
 * ```
 */
export const deleteSessionForStudentAssignment = new PreparedQuery<IDeleteSessionForStudentAssignmentParams,IDeleteSessionForStudentAssignmentResult>(deleteSessionForStudentAssignmentIR);


/** Query 'EditAssignmentById' is invalid, so its result is assigned type 'never'.
 *  */
export type IEditAssignmentByIdResult = never;

/** Query 'EditAssignmentById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IEditAssignmentByIdParams = never;

const editAssignmentByIdIR: any = {"usedParamSet":{"description":true,"title":true,"numberOfSessions":true,"minDurationInMinutes":true,"isRequired":true,"dueDate":true,"startDate":true,"subjectId":true,"id":true},"params":[{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":54,"b":65}]},{"name":"title","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":108}]},{"name":"numberOfSessions","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":169}]},{"name":"minDurationInMinutes","required":false,"transform":{"type":"scalar"},"locs":[{"a":232,"b":252}]},{"name":"isRequired","required":false,"transform":{"type":"scalar"},"locs":[{"a":308,"b":318}]},{"name":"dueDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":359,"b":366}]},{"name":"startDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":406,"b":415}]},{"name":"subjectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":457,"b":466}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":520,"b":523}]}],"statement":"UPDATE\n    assignments\nSET\n    description = COALESCE(:description, description),\n    title = COALESCE(:title, title),\n    number_of_sessions = COALESCE(:numberOfSessions, number_of_sessions),\n    min_duration_in_minutes = COALESCE(:minDurationInMinutes, min_duration_in_minutes),\n    is_required = COALESCE(:isRequired, is_required),\n    due_date = COALESCE(:dueDate, due_date),\n    start_date = COALESCE(:startDate, start_date),\n    subject_id = COALESCE(:subjectId, subject_id),\n    updated_at = NOW()\nWHERE\n    id = :id!\nRETURNING\n    id,\n    class_id,\n    description,\n    title,\n    number_of_sessions,\n    min_duration_in_minutes,\n    is_required,\n    due_date,\n    start_date,\n    subject_id,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     assignments
 * SET
 *     description = COALESCE(:description, description),
 *     title = COALESCE(:title, title),
 *     number_of_sessions = COALESCE(:numberOfSessions, number_of_sessions),
 *     min_duration_in_minutes = COALESCE(:minDurationInMinutes, min_duration_in_minutes),
 *     is_required = COALESCE(:isRequired, is_required),
 *     due_date = COALESCE(:dueDate, due_date),
 *     start_date = COALESCE(:startDate, start_date),
 *     subject_id = COALESCE(:subjectId, subject_id),
 *     updated_at = NOW()
 * WHERE
 *     id = :id!
 * RETURNING
 *     id,
 *     class_id,
 *     description,
 *     title,
 *     number_of_sessions,
 *     min_duration_in_minutes,
 *     is_required,
 *     due_date,
 *     start_date,
 *     subject_id,
 *     created_at,
 *     updated_at
 * ```
 */
export const editAssignmentById = new PreparedQuery<IEditAssignmentByIdParams,IEditAssignmentByIdResult>(editAssignmentByIdIR);


/** Query 'DeleteSessionForStudentAssignmentByStudentId' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteSessionForStudentAssignmentByStudentIdResult = never;

/** Query 'DeleteSessionForStudentAssignmentByStudentId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteSessionForStudentAssignmentByStudentIdParams = never;

const deleteSessionForStudentAssignmentByStudentIdIR: any = {"usedParamSet":{"assignmentId":true,"studentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":77}]},{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":97,"b":107}]}],"statement":"DELETE FROM sessions_students_assignments\nWHERE assignment_id = :assignmentId!\n    AND user_id = :studentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM sessions_students_assignments
 * WHERE assignment_id = :assignmentId!
 *     AND user_id = :studentId!
 * ```
 */
export const deleteSessionForStudentAssignmentByStudentId = new PreparedQuery<IDeleteSessionForStudentAssignmentByStudentIdParams,IDeleteSessionForStudentAssignmentByStudentIdResult>(deleteSessionForStudentAssignmentByStudentIdIR);


/** Query 'DeleteStudentAssignmentByStudentId' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeleteStudentAssignmentByStudentIdResult = never;

/** Query 'DeleteStudentAssignmentByStudentId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeleteStudentAssignmentByStudentIdParams = never;

const deleteStudentAssignmentByStudentIdIR: any = {"usedParamSet":{"assignmentId":true,"studentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":68}]},{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":98}]}],"statement":"DELETE FROM students_assignments\nWHERE assignment_id = :assignmentId!\n    AND user_id = :studentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM students_assignments
 * WHERE assignment_id = :assignmentId!
 *     AND user_id = :studentId!
 * ```
 */
export const deleteStudentAssignmentByStudentId = new PreparedQuery<IDeleteStudentAssignmentByStudentIdParams,IDeleteStudentAssignmentByStudentIdResult>(deleteStudentAssignmentByStudentIdIR);


