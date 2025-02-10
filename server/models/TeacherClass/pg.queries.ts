/** Types generated for queries found in "server/models/TeacherClass/teacher_class.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetTeacherClassesForStudent' parameters type */
export interface IGetTeacherClassesForStudentParams {
  studentId: string;
}

/** 'GetTeacherClassesForStudent' return type */
export interface IGetTeacherClassesForStudentResult {
  active: boolean;
  createdAt: Date;
  id: string;
  name: string;
  topicId: number | null;
  updatedAt: Date;
}

/** 'GetTeacherClassesForStudent' query type */
export interface IGetTeacherClassesForStudentQuery {
  params: IGetTeacherClassesForStudentParams;
  result: IGetTeacherClassesForStudentResult;
}

const getTeacherClassesForStudentIR: any = {"usedParamSet":{"studentId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":211}]}],"statement":"SELECT\n    tc.id,\n    tc.name,\n    active,\n    topic_id,\n    tc.created_at,\n    tc.updated_at\nFROM\n    teacher_classes tc\n    LEFT JOIN student_classes sc ON tc.id = sc.class_id\nWHERE\n    sc.user_id = :studentId!\n    AND tc.deactivated_on IS NULL\nORDER BY\n    tc.created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tc.id,
 *     tc.name,
 *     active,
 *     topic_id,
 *     tc.created_at,
 *     tc.updated_at
 * FROM
 *     teacher_classes tc
 *     LEFT JOIN student_classes sc ON tc.id = sc.class_id
 * WHERE
 *     sc.user_id = :studentId!
 *     AND tc.deactivated_on IS NULL
 * ORDER BY
 *     tc.created_at ASC
 * ```
 */
export const getTeacherClassesForStudent = new PreparedQuery<IGetTeacherClassesForStudentParams,IGetTeacherClassesForStudentResult>(getTeacherClassesForStudentIR);


/** 'GetTotalStudentsInClass' parameters type */
export interface IGetTotalStudentsInClassParams {
  classId: string;
}

/** 'GetTotalStudentsInClass' return type */
export interface IGetTotalStudentsInClassResult {
  count: number | null;
}

/** 'GetTotalStudentsInClass' query type */
export interface IGetTotalStudentsInClassQuery {
  params: IGetTotalStudentsInClassParams;
  result: IGetTotalStudentsInClassResult;
}

const getTotalStudentsInClassIR: any = {"usedParamSet":{"classId":true},"params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":88}]}],"statement":"SELECT\n    COUNT(*)::int AS count\nFROM\n    student_classes\nWHERE\n    class_id = :classId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)::int AS count
 * FROM
 *     student_classes
 * WHERE
 *     class_id = :classId!
 * ```
 */
export const getTotalStudentsInClass = new PreparedQuery<IGetTotalStudentsInClassParams,IGetTotalStudentsInClassResult>(getTotalStudentsInClassIR);


/** 'RemoveStudentsFromClass' parameters type */
export interface IRemoveStudentsFromClassParams {
  classId: string;
  studentIds: readonly (string)[];
}

/** 'RemoveStudentsFromClass' return type */
export interface IRemoveStudentsFromClassResult {
  studentid: string;
}

/** 'RemoveStudentsFromClass' query type */
export interface IRemoveStudentsFromClassQuery {
  params: IRemoveStudentsFromClassParams;
  result: IRemoveStudentsFromClassResult;
}

const removeStudentsFromClassIR: any = {"usedParamSet":{"studentIds":true,"classId":true},"params":[{"name":"studentIds","required":true,"transform":{"type":"array_spread"},"locs":[{"a":45,"b":56}]},{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":85}]}],"statement":"DELETE FROM student_classes\nWHERE user_id IN :studentIds!\n    AND class_id = :classId!\nRETURNING\n    user_id AS studentId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_classes
 * WHERE user_id IN :studentIds!
 *     AND class_id = :classId!
 * RETURNING
 *     user_id AS studentId
 * ```
 */
export const removeStudentsFromClass = new PreparedQuery<IRemoveStudentsFromClassParams,IRemoveStudentsFromClassResult>(removeStudentsFromClassIR);


