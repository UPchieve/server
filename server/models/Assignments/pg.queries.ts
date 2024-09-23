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


/** 'GetAssignmentsByStudentId' parameters type */
export interface IGetAssignmentsByStudentIdParams {
  userId: string;
}

/** 'GetAssignmentsByStudentId' return type */
export interface IGetAssignmentsByStudentIdResult {
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

const getAssignmentsByStudentIdIR: any = {"name":"getAssignmentsByStudentId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1701,"b":1707,"line":54,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    assignments.class_id,\n    assignments.description,\n    assignments.title,\n    assignments.number_of_sessions,\n    assignments.min_duration_in_minutes,\n    assignments.due_date,\n    assignments.subject_id,\n    subjects.name AS subject_name,\n    assignments.start_date,\n    assignments.is_required,\n    assignments.id,\n    students_assignments.submitted_at\nFROM\n    assignments\n    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id\n    LEFT JOIN subjects ON assignments.subject_id = subjects.id\nWHERE\n    students_assignments.user_id = :userId!","loc":{"a":1119,"b":1707,"line":36,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     assignments.class_id,
 *     assignments.description,
 *     assignments.title,
 *     assignments.number_of_sessions,
 *     assignments.min_duration_in_minutes,
 *     assignments.due_date,
 *     assignments.subject_id,
 *     subjects.name AS subject_name,
 *     assignments.start_date,
 *     assignments.is_required,
 *     assignments.id,
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

const getAllAssignmentsForTeacherIR: any = {"name":"getAllAssignmentsForTeacher","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1905,"b":1911,"line":64,"col":31}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    assignments.*\nFROM\n    assignments\n    JOIN teacher_classes ON assignments.class_id = teacher_classes.id\nWHERE\n    teacher_classes.user_id = :userId!","loc":{"a":1752,"b":1911,"line":58,"col":0}}};

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

const getStudentAssignmentCompletionIR: any = {"name":"getStudentAssignmentCompletion","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2188,"b":2200,"line":76,"col":42}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"SELECT\n    users.first_name,\n    users.last_name,\n    students_assignments.submitted_at\nFROM\n    students_assignments\n    LEFT JOIN users ON students_assignments.user_id = users.id\nWHERE\n    students_assignments.assignment_id = :assignmentId!","loc":{"a":1959,"b":2200,"line":68,"col":0}}};

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
  description: string | null;
  dueDate: Date | null;
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

const getStudentAssignmentForSessionIR: any = {"name":"getStudentAssignmentForSession","params":[{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2615,"b":2623,"line":95,"col":22}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    a.title,\n    a.description,\n    a.number_of_sessions,\n    a.min_duration_in_minutes,\n    a.due_date,\n    a.start_date,\n    a.subject_id,\n    subjects.name AS subject_name,\n    sa.created_at AS assigned_at,\n    sa.submitted_at\nFROM\n    assignments a\n    LEFT JOIN students_assignments sa ON sa.assignment_id = a.id\n    LEFT JOIN sessions_students_assignments ssa ON ssa.assignment_id = sa.assignment_id\n        AND ssa.user_id = sa.user_id\n    LEFT JOIN subjects ON a.subject_id = subjects.id\nWHERE\n    ssa.session_id = :sessionId","loc":{"a":2084,"b":2623,"line":77,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     a.title,
 *     a.description,
 *     a.number_of_sessions,
 *     a.min_duration_in_minutes,
 *     a.due_date,
 *     a.start_date,
 *     a.subject_id,
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

const linkSessionToAssignmentIR: any = {"name":"linkSessionToAssignment","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2756,"b":2765,"line":100,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2769,"b":2775,"line":100,"col":26}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2779,"b":2791,"line":100,"col":36}]}}],"usedParamSet":{"sessionId":true,"userId":true,"assignmentId":true},"statement":{"body":"INSERT INTO sessions_students_assignments (session_id, user_id, assignment_id)\n    VALUES (:sessionId!, :userId!, :assignmentId!)\nON CONFLICT\n    DO NOTHING","loc":{"a":2664,"b":2819,"line":99,"col":0}}};

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


