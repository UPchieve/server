/** Types generated for queries found in "server/models/Assignments/assignments.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateAssignment' parameters type */
export interface ICreateAssignmentParams {
  classId: string;
  description: string | null | void;
  dueDate: Date | null | void;
  id: string;
  isRequired: boolean | null | void;
  minDurationInMinutes: number | null | void;
  numberOfSessions: number | null | void;
  startDate: Date | null | void;
  subjectId: number | null | void;
  title: string | null | void;
}

/** 'CreateAssignment' return type */
export interface ICreateAssignmentResult {
  classId: string;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  title: string | null;
  updatedAt: Date;
}

/** 'CreateAssignment' query type */
export interface ICreateAssignmentQuery {
  params: ICreateAssignmentParams;
  result: ICreateAssignmentResult;
}

const createAssignmentIR: any = {"name":"createAssignment","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":217,"b":219,"line":3,"col":13}]}},{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":223,"b":230,"line":3,"col":19}]}},{"name":"description","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":234,"b":244,"line":3,"col":30}]}},{"name":"title","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":248,"b":252,"line":3,"col":44}]}},{"name":"numberOfSessions","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":256,"b":271,"line":3,"col":52}]}},{"name":"minDurationInMinutes","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":275,"b":294,"line":3,"col":71}]}},{"name":"dueDate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":298,"b":304,"line":3,"col":94}]}},{"name":"isRequired","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":308,"b":317,"line":3,"col":104}]}},{"name":"startDate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":321,"b":329,"line":3,"col":117}]}},{"name":"subjectId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":333,"b":341,"line":3,"col":129}]}}],"usedParamSet":{"id":true,"classId":true,"description":true,"title":true,"numberOfSessions":true,"minDurationInMinutes":true,"dueDate":true,"isRequired":true,"startDate":true,"subjectId":true},"statement":{"body":"INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, is_required, start_date, subject_id, created_at, updated_at)\n    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :isRequired, :startDate, :subjectId, NOW(), NOW())\nRETURNING\n    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, is_required, due_date, start_date, subject_id, created_at, updated_at","loc":{"a":29,"b":519,"line":2,"col":0}}};

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


/** 'GetAssignmentsByClassId' parameters type */
export interface IGetAssignmentsByClassIdParams {
  classId: string;
}

/** 'GetAssignmentsByClassId' return type */
export interface IGetAssignmentsByClassIdResult {
  classId: string;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  title: string | null;
  updatedAt: Date;
}

/** 'GetAssignmentsByClassId' query type */
export interface IGetAssignmentsByClassIdQuery {
  params: IGetAssignmentsByClassIdParams;
  result: IGetAssignmentsByClassIdResult;
}

const getAssignmentsByClassIdIR: any = {"name":"getAssignmentsByClassId","params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":616,"b":623,"line":14,"col":16}]}}],"usedParamSet":{"classId":true},"statement":{"body":"SELECT\n    *\nFROM\n    assignments\nWHERE\n    class_id = :classId!","loc":{"a":560,"b":623,"line":9,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     assignments
 * WHERE
 *     class_id = :classId!
 * ```
 */
export const getAssignmentsByClassId = new PreparedQuery<IGetAssignmentsByClassIdParams,IGetAssignmentsByClassIdResult>(getAssignmentsByClassIdIR);


/** 'GetAssignmentById' parameters type */
export interface IGetAssignmentByIdParams {
  assignmentId: string;
}

/** 'GetAssignmentById' return type */
export interface IGetAssignmentByIdResult {
  classId: string;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  subjectName: string;
  title: string | null;
  updatedAt: Date;
}

/** 'GetAssignmentById' query type */
export interface IGetAssignmentByIdQuery {
  params: IGetAssignmentByIdParams;
  result: IGetAssignmentByIdResult;
}

const getAssignmentByIdIR: any = {"name":"getAssignmentById","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":830,"b":842,"line":25,"col":22}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"SELECT\n    assignments.*,\n    subjects.name AS subject_name\nFROM\n    assignments\n    LEFT JOIN subjects ON assignments.subject_id = subjects.id\nWHERE\n    assignments.id = :assignmentId!","loc":{"a":658,"b":842,"line":18,"col":0}}};

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


/** 'CreateStudentAssignment' parameters type */
export interface ICreateStudentAssignmentParams {
  assignmentId: string;
  userId: string;
}

/** 'CreateStudentAssignment' return type */
export interface ICreateStudentAssignmentResult {
  assignmentId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/** 'CreateStudentAssignment' query type */
export interface ICreateStudentAssignmentQuery {
  params: ICreateStudentAssignmentParams;
  result: ICreateStudentAssignmentResult;
}

const createStudentAssignmentIR: any = {"name":"createStudentAssignment","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":978,"b":984,"line":30,"col":13}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":988,"b":1000,"line":30,"col":23}]}}],"usedParamSet":{"userId":true,"assignmentId":true},"statement":{"body":"INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at)\n    VALUES (:userId!, :assignmentId!, NOW(), NOW())\nRETURNING\n    user_id, assignment_id, created_at, updated_at","loc":{"a":883,"b":1076,"line":29,"col":0}}};

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


/** 'CreateStudentAssignments' parameters type */
export interface ICreateStudentAssignmentsParams {
  studentAssignments: readonly ({
    userId: string,
    assignmentId: string
  })[];
}

/** 'CreateStudentAssignments' return type */
export interface ICreateStudentAssignmentsResult {
  assignmentId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

/** 'CreateStudentAssignments' query type */
export interface ICreateStudentAssignmentsQuery {
  params: ICreateStudentAssignmentsParams;
  result: ICreateStudentAssignmentsResult;
}

const createStudentAssignmentsIR: any = {"name":"createStudentAssignments","params":[{"name":"studentAssignments","codeRefs":{"defined":{"a":1124,"b":1141,"line":37,"col":8},"used":[{"a":1258,"b":1276,"line":41,"col":9}]},"transform":{"type":"pick_array_spread","keys":[{"name":"userId","required":true},{"name":"assignmentId","required":true}]},"required":true}],"usedParamSet":{"studentAssignments":true},"statement":{"body":"INSERT INTO students_assignments (user_id, assignment_id)\n    VALUES\n        :studentAssignments!\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        user_id, assignment_id, created_at, updated_at","loc":{"a":1180,"b":1380,"line":39,"col":0}}};

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


/** 'UpdateSubmittedAtOfStudentAssignment' parameters type */
export interface IUpdateSubmittedAtOfStudentAssignmentParams {
  assignmentId: string;
  userId: string;
}

/** 'UpdateSubmittedAtOfStudentAssignment' return type */
export type IUpdateSubmittedAtOfStudentAssignmentResult = void;

/** 'UpdateSubmittedAtOfStudentAssignment' query type */
export interface IUpdateSubmittedAtOfStudentAssignmentQuery {
  params: IUpdateSubmittedAtOfStudentAssignmentParams;
  result: IUpdateSubmittedAtOfStudentAssignmentResult;
}

const updateSubmittedAtOfStudentAssignmentIR: any = {"name":"updateSubmittedAtOfStudentAssignment","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1516,"b":1522,"line":54,"col":15}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1549,"b":1561,"line":55,"col":25}]}}],"usedParamSet":{"userId":true,"assignmentId":true},"statement":{"body":"UPDATE\n    students_assignments\nSET\n    submitted_at = NOW()\nWHERE\n    user_id = :userId!\n    AND assignment_id = :assignmentId!","loc":{"a":1434,"b":1561,"line":49,"col":0}}};

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


/** 'GetAssignmentsByStudentId' parameters type */
export interface IGetAssignmentsByStudentIdParams {
  userId: string;
}

/** 'GetAssignmentsByStudentId' return type */
export interface IGetAssignmentsByStudentIdResult {
  assignedAt: Date;
  classId: string;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  subjectName: string;
  submittedAt: Date | null;
  title: string | null;
}

/** 'GetAssignmentsByStudentId' query type */
export interface IGetAssignmentsByStudentIdQuery {
  params: IGetAssignmentsByStudentIdParams;
  result: IGetAssignmentsByStudentIdResult;
}

const getAssignmentsByStudentIdIR: any = {"name":"getAssignmentsByStudentId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2238,"b":2244,"line":78,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    assignments.id,\n    students_assignments.created_at AS assigned_at,\n    assignments.class_id,\n    assignments.description,\n    assignments.title,\n    assignments.number_of_sessions,\n    assignments.min_duration_in_minutes,\n    assignments.is_required,\n    assignments.due_date,\n    assignments.start_date,\n    assignments.subject_id,\n    subjects.name AS subject_name,\n    students_assignments.submitted_at\nFROM\n    assignments\n    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id\n    LEFT JOIN subjects ON assignments.subject_id = subjects.id\nWHERE\n    students_assignments.user_id = :userId!","loc":{"a":1604,"b":2244,"line":59,"col":0}}};

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


/** 'GetAllAssignmentsForTeacher' parameters type */
export interface IGetAllAssignmentsForTeacherParams {
  userId: string;
}

/** 'GetAllAssignmentsForTeacher' return type */
export interface IGetAllAssignmentsForTeacherResult {
  classId: string;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  title: string | null;
  updatedAt: Date;
}

/** 'GetAllAssignmentsForTeacher' query type */
export interface IGetAllAssignmentsForTeacherQuery {
  params: IGetAllAssignmentsForTeacherParams;
  result: IGetAllAssignmentsForTeacherResult;
}

const getAllAssignmentsForTeacherIR: any = {"name":"getAllAssignmentsForTeacher","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2442,"b":2448,"line":88,"col":31}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    assignments.*\nFROM\n    assignments\n    JOIN teacher_classes ON assignments.class_id = teacher_classes.id\nWHERE\n    teacher_classes.user_id = :userId!","loc":{"a":2289,"b":2448,"line":82,"col":0}}};

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


/** 'GetStudentAssignmentCompletion' parameters type */
export interface IGetStudentAssignmentCompletionParams {
  assignmentId: string;
}

/** 'GetStudentAssignmentCompletion' return type */
export interface IGetStudentAssignmentCompletionResult {
  firstName: string;
  lastName: string;
  submittedAt: Date | null;
}

/** 'GetStudentAssignmentCompletion' query type */
export interface IGetStudentAssignmentCompletionQuery {
  params: IGetStudentAssignmentCompletionParams;
  result: IGetStudentAssignmentCompletionResult;
}

const getStudentAssignmentCompletionIR: any = {"name":"getStudentAssignmentCompletion","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2725,"b":2737,"line":100,"col":42}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"SELECT\n    users.first_name,\n    users.last_name,\n    students_assignments.submitted_at\nFROM\n    students_assignments\n    LEFT JOIN users ON students_assignments.user_id = users.id\nWHERE\n    students_assignments.assignment_id = :assignmentId!","loc":{"a":2496,"b":2737,"line":92,"col":0}}};

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


/** 'GetStudentAssignmentForSession' parameters type */
export interface IGetStudentAssignmentForSessionParams {
  sessionId: string | null | void;
}

/** 'GetStudentAssignmentForSession' return type */
export interface IGetStudentAssignmentForSessionResult {
  assignedAt: Date;
  classId: string;
  description: string | null;
  dueDate: Date | null;
  id: string;
  isRequired: boolean;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startDate: Date | null;
  subjectId: number | null;
  subjectName: string;
  submittedAt: Date | null;
  title: string | null;
}

/** 'GetStudentAssignmentForSession' query type */
export interface IGetStudentAssignmentForSessionQuery {
  params: IGetStudentAssignmentForSessionParams;
  result: IGetStudentAssignmentForSessionResult;
}

const getStudentAssignmentForSessionIR: any = {"name":"getStudentAssignmentForSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3361,"b":3369,"line":125,"col":22}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    a.id,\n    a.class_id,\n    a.title,\n    a.description,\n    a.number_of_sessions,\n    a.min_duration_in_minutes,\n    a.due_date,\n    a.start_date,\n    a.subject_id,\n    a.is_required,\n    subjects.name AS subject_name,\n    sa.created_at AS assigned_at,\n    sa.submitted_at\nFROM\n    assignments a\n    LEFT JOIN students_assignments sa ON sa.assignment_id = a.id\n    LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id\n        AND ssa.user_id = sa.user_id\n    LEFT JOIN subjects ON a.subject_id = subjects.id\nWHERE\n    ssa.session_id = :sessionId","loc":{"a":2785,"b":3369,"line":104,"col":0}}};

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


/** 'LinkSessionToAssignment' parameters type */
export interface ILinkSessionToAssignmentParams {
  assignmentId: string;
  sessionId: string;
  userId: string;
}

/** 'LinkSessionToAssignment' return type */
export type ILinkSessionToAssignmentResult = void;

/** 'LinkSessionToAssignment' query type */
export interface ILinkSessionToAssignmentQuery {
  params: ILinkSessionToAssignmentParams;
  result: ILinkSessionToAssignmentResult;
}

const linkSessionToAssignmentIR: any = {"name":"linkSessionToAssignment","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3502,"b":3511,"line":130,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3515,"b":3521,"line":130,"col":26}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3525,"b":3537,"line":130,"col":36}]}}],"usedParamSet":{"sessionId":true,"userId":true,"assignmentId":true},"statement":{"body":"INSERT INTO sessions_students_assignments (session_id, user_id, assignment_id)\n    VALUES (:sessionId!, :userId!, :assignmentId!)\nON CONFLICT\n    DO NOTHING","loc":{"a":3410,"b":3565,"line":129,"col":0}}};

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


/** 'GetSessionsForStudentAssignment' parameters type */
export interface IGetSessionsForStudentAssignmentParams {
  assignmentId: string;
  userId: string;
}

/** 'GetSessionsForStudentAssignment' return type */
export interface IGetSessionsForStudentAssignmentResult {
  endedAt: Date | null;
  timeTutored: string;
  volunteerJoinedAt: Date | null;
}

/** 'GetSessionsForStudentAssignment' query type */
export interface IGetSessionsForStudentAssignmentQuery {
  params: IGetSessionsForStudentAssignmentParams;
  result: IGetSessionsForStudentAssignmentResult;
}

const getSessionsForStudentAssignmentIR: any = {"name":"getSessionsForStudentAssignment","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3792,"b":3798,"line":144,"col":15}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3825,"b":3837,"line":145,"col":25}]}}],"usedParamSet":{"userId":true,"assignmentId":true},"statement":{"body":"SELECT\n    s.volunteer_joined_at,\n    s.ended_at,\n    s.time_tutored\nFROM\n    sessions_students_assignments ssa\n    JOIN sessions s ON s.id = ssa.session_id\nWHERE\n    user_id = :userId!\n    AND assignment_id = :assignmentId!","loc":{"a":3614,"b":3837,"line":136,"col":0}}};

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


/** 'DeleteStudentAssignment' parameters type */
export interface IDeleteStudentAssignmentParams {
  assignmentId: string;
}

/** 'DeleteStudentAssignment' return type */
export type IDeleteStudentAssignmentResult = void;

/** 'DeleteStudentAssignment' query type */
export interface IDeleteStudentAssignmentQuery {
  params: IDeleteStudentAssignmentParams;
  result: IDeleteStudentAssignmentResult;
}

const deleteStudentAssignmentIR: any = {"name":"deleteStudentAssignment","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3913,"b":3925,"line":149,"col":23}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"DELETE FROM students_assignments\nWHERE assignment_id = :assignmentId!","loc":{"a":3857,"b":3925,"line":148,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM students_assignments
 * WHERE assignment_id = :assignmentId!
 * ```
 */
export const deleteStudentAssignment = new PreparedQuery<IDeleteStudentAssignmentParams,IDeleteStudentAssignmentResult>(deleteStudentAssignmentIR);


/** 'DeleteAssignment' parameters type */
export interface IDeleteAssignmentParams {
  assignmentId: string;
}

/** 'DeleteAssignment' return type */
export type IDeleteAssignmentResult = void;

/** 'DeleteAssignment' query type */
export interface IDeleteAssignmentQuery {
  params: IDeleteAssignmentParams;
  result: IDeleteAssignmentResult;
}

const deleteAssignmentIR: any = {"name":"deleteAssignment","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3995,"b":4007,"line":154,"col":12}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"DELETE FROM assignments\nWHERE id = :assignmentId!","loc":{"a":3959,"b":4007,"line":153,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM assignments
 * WHERE id = :assignmentId!
 * ```
 */
export const deleteAssignment = new PreparedQuery<IDeleteAssignmentParams,IDeleteAssignmentResult>(deleteAssignmentIR);


