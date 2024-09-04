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

const getAssignmentsByClassIdIR: any = {"name":"getAssignmentsByClassId","params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":807,"b":814,"line":25,"col":16}]}}],"usedParamSet":{"classId":true},"statement":{"body":"SELECT\n    id,\n    class_id,\n    description,\n    title,\n    number_of_sessions,\n    min_duration_in_minutes,\n    is_required,\n    due_date,\n    start_date,\n    subject_id,\n    created_at,\n    updated_at\nFROM\n    assignments\nWHERE\n    class_id = :classId!","loc":{"a":560,"b":814,"line":9,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
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
 * FROM
 *     assignments
 * WHERE
 *     class_id = :classId!
 * ```
 */
export const getAssignmentsByClassId = new PreparedQuery<IGetAssignmentsByClassIdParams,IGetAssignmentsByClassIdResult>(getAssignmentsByClassIdIR);


