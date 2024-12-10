/** Types generated for queries found in "server/models/Assignments/assignments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'CreateAssignment' parameters type */
export interface ICreateAssignmentParams {
  classId: string;
  description?: string | null | void;
  dueDate?: DateOrString | null | void;
  id: string;
  isRequired?: boolean | null | void;
  minDurationInMinutes?: number | null | void;
  numberOfSessions?: number | null | void;
  startDate?: DateOrString | null | void;
  subjectId?: number | null | void;
  title?: string | null | void;
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

const getAssignmentsByClassIdIR: any = {"usedParamSet":{"classId":true},"params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":63}]}],"statement":"SELECT\n    *\nFROM\n    assignments\nWHERE\n    class_id = :classId!"};

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


/** 'GetStudentAssignmentForSession' parameters type */
export interface IGetStudentAssignmentForSessionParams {
  sessionId?: string | null | void;
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

const deleteStudentAssignmentIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":68}]}],"statement":"DELETE FROM students_assignments\nWHERE assignment_id = :assignmentId!"};

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

const deleteAssignmentIR: any = {"usedParamSet":{"assignmentId":true},"params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":48}]}],"statement":"DELETE FROM assignments\nWHERE id = :assignmentId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM assignments
 * WHERE id = :assignmentId!
 * ```
 */
export const deleteAssignment = new PreparedQuery<IDeleteAssignmentParams,IDeleteAssignmentResult>(deleteAssignmentIR);


