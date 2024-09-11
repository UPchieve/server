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
  title: string | null;
  updatedAt: Date;
}

/** 'GetAssignmentById' query type */
export interface IGetAssignmentByIdQuery {
  params: IGetAssignmentByIdParams;
  result: IGetAssignmentByIdResult;
}

const getAssignmentByIdIR: any = {"name":"getAssignmentById","params":[{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":708,"b":720,"line":23,"col":10}]}}],"usedParamSet":{"assignmentId":true},"statement":{"body":"SELECT\n    *\nFROM\n    assignments\nWHERE\n    id = :assignmentId!","loc":{"a":658,"b":720,"line":18,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     assignments
 * WHERE
 *     id = :assignmentId!
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

const createStudentAssignmentIR: any = {"name":"createStudentAssignment","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":856,"b":862,"line":28,"col":13}]}},{"name":"assignmentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":866,"b":878,"line":28,"col":23}]}}],"usedParamSet":{"userId":true,"assignmentId":true},"statement":{"body":"INSERT INTO students_assignments (user_id, assignment_id, created_at, updated_at)\n    VALUES (:userId!, :assignmentId!, NOW(), NOW())\nRETURNING\n    user_id, assignment_id, created_at, updated_at","loc":{"a":761,"b":954,"line":27,"col":0}}};

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
  submittedAt: Date | null;
  title: string | null;
}

/** 'GetAssignmentsByStudentId' query type */
export interface IGetAssignmentsByStudentIdQuery {
  params: IGetAssignmentsByStudentIdParams;
  result: IGetAssignmentsByStudentIdResult;
}

const getAssignmentsByStudentIdIR: any = {"name":"getAssignmentsByStudentId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1481,"b":1487,"line":50,"col":36}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    assignments.class_id,\n    assignments.description,\n    assignments.title,\n    assignments.number_of_sessions,\n    assignments.min_duration_in_minutes,\n    assignments.due_date,\n    assignments.subject_id,\n    assignments.start_date,\n    assignments.is_required,\n    assignments.id,\n    students_assignments.submitted_at\nFROM\n    assignments\n    LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id\nWHERE\n    students_assignments.user_id = :userId!","loc":{"a":997,"b":1487,"line":34,"col":0}}};

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
 *     assignments.start_date,
 *     assignments.is_required,
 *     assignments.id,
 *     students_assignments.submitted_at
 * FROM
 *     assignments
 *     LEFT JOIN students_assignments ON assignments.id = students_assignments.assignment_id
 * WHERE
 *     students_assignments.user_id = :userId!
 * ```
 */
export const getAssignmentsByStudentId = new PreparedQuery<IGetAssignmentsByStudentIdParams,IGetAssignmentsByStudentIdResult>(getAssignmentsByStudentIdIR);


