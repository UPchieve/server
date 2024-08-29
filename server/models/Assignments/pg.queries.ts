/** Types generated for queries found in "server/models/Assignments/assignments.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateAssignment' parameters type */
export interface ICreateAssignmentParams {
  classId: string;
  description: string | null | void;
  dueDate: Date | null | void;
  id: string;
  minDurationInMinutes: number | null | void;
  numberOfSessions: number | null | void;
  startAt: Date | null | void;
  subjectId: number | null | void;
  title: string | null | void;
}

/** 'CreateAssignment' return type */
export interface ICreateAssignmentResult {
  classId: string | null;
  createdAt: Date;
  description: string | null;
  dueDate: Date | null;
  id: string;
  minDurationInMinutes: number | null;
  numberOfSessions: number | null;
  startAt: Date | null;
  subjectId: number | null;
  title: string | null;
  updatedAt: Date;
}

/** 'CreateAssignment' query type */
export interface ICreateAssignmentQuery {
  params: ICreateAssignmentParams;
  result: ICreateAssignmentResult;
}

const createAssignmentIR: any = {"name":"createAssignment","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":201,"b":203,"line":3,"col":13}]}},{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":207,"b":214,"line":3,"col":19}]}},{"name":"description","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":218,"b":228,"line":3,"col":30}]}},{"name":"title","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":232,"b":236,"line":3,"col":44}]}},{"name":"numberOfSessions","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":240,"b":255,"line":3,"col":52}]}},{"name":"minDurationInMinutes","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":259,"b":278,"line":3,"col":71}]}},{"name":"dueDate","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":282,"b":288,"line":3,"col":94}]}},{"name":"startAt","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":292,"b":298,"line":3,"col":104}]}},{"name":"subjectId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":302,"b":310,"line":3,"col":114}]}}],"usedParamSet":{"id":true,"classId":true,"description":true,"title":true,"numberOfSessions":true,"minDurationInMinutes":true,"dueDate":true,"startAt":true,"subjectId":true},"statement":{"body":"INSERT INTO assignments(id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at)\n    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :startAt, :subjectId, NOW(), NOW())\nRETURNING id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at","loc":{"a":29,"b":469,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO assignments(id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at)
 *     VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :startAt, :subjectId, NOW(), NOW())
 * RETURNING id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at
 * ```
 */
export const createAssignment = new PreparedQuery<ICreateAssignmentParams,ICreateAssignmentResult>(createAssignmentIR);


