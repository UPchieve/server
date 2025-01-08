/** Types generated for queries found in "server/models/TeacherClass/teacher_class.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'GetTeacherClassesForStudent' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTeacherClassesForStudentResult = never;

/** Query 'GetTeacherClassesForStudent' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTeacherClassesForStudentParams = never;

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


/** Query 'GetTotalStudentsInClass' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTotalStudentsInClassResult = never;

/** Query 'GetTotalStudentsInClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTotalStudentsInClassParams = never;

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


/** Query 'RemoveStudentFromClass' is invalid, so its result is assigned type 'never'.
 *  */
export type IRemoveStudentFromClassResult = never;

/** Query 'RemoveStudentFromClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IRemoveStudentFromClassParams = never;

const removeStudentFromClassIR: any = {"usedParamSet":{"studentId":true,"classId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":54}]},{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":75,"b":83}]}],"statement":"DELETE FROM student_classes\nWHERE user_id = :studentId!\n    AND class_id = :classId!\nRETURNING\n    user_id AS studentId"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM student_classes
 * WHERE user_id = :studentId!
 *     AND class_id = :classId!
 * RETURNING
 *     user_id AS studentId
 * ```
 */
export const removeStudentFromClass = new PreparedQuery<IRemoveStudentFromClassParams,IRemoveStudentFromClassResult>(removeStudentFromClassIR);


