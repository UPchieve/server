/** Types generated for queries found in "server/models/TeacherClass/teacher_class.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getTeacherClassesForStudentIR: any = {"name":"getTeacherClassesForStudent","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":242,"b":251,"line":13,"col":18}]}}],"usedParamSet":{"studentId":true},"statement":{"body":"SELECT\n    tc.id,\n    tc.name,\n    active,\n    topic_id,\n    tc.created_at,\n    tc.updated_at\nFROM\n    teacher_classes tc\n    LEFT JOIN student_classes sc ON tc.id = sc.class_id\nWHERE\n    sc.user_id = :studentId!\n    AND tc.deactivated_on IS NULL\nORDER BY\n    tc.created_at ASC","loc":{"a":40,"b":316,"line":2,"col":0}}};

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

const getTotalStudentsInClassIR: any = {"name":"getTotalStudentsInClass","params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":438,"b":445,"line":25,"col":16}]}}],"usedParamSet":{"classId":true},"statement":{"body":"SELECT\n    COUNT(*)::int AS count\nFROM\n    student_classes\nWHERE\n    class_id = :classId!","loc":{"a":357,"b":445,"line":20,"col":0}}};

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


/** 'RemoveStudentFromClass' parameters type */
export interface IRemoveStudentFromClassParams {
  classId: string;
  studentId: string;
}

/** 'RemoveStudentFromClass' return type */
export interface IRemoveStudentFromClassResult {
  studentid: string;
}

/** 'RemoveStudentFromClass' query type */
export interface IRemoveStudentFromClassQuery {
  params: IRemoveStudentFromClassParams;
  result: IRemoveStudentFromClassResult;
}

const removeStudentFromClassIR: any = {"name":"removeStudentFromClass","params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":530,"b":539,"line":30,"col":17}]}},{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":561,"b":568,"line":31,"col":20}]}}],"usedParamSet":{"studentId":true,"classId":true},"statement":{"body":"DELETE FROM student_classes\nWHERE user_id = :studentId!\n    AND class_id = :classId!\nRETURNING\n    user_id AS studentId","loc":{"a":485,"b":603,"line":29,"col":0}}};

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


